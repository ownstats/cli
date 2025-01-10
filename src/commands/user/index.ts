import { Command, Args } from '@oclif/core'
import { ux } from '@oclif/core'
import inquirer from 'inquirer'
import { 
  CognitoIdentityProviderClient, 
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import StorageHelper from '../../helpers/storage'
import { isProjectFolder } from '../../helpers/utils'
import { fromIni } from '@aws-sdk/credential-providers'

type UserAction = 'create' | 'update-password'

const validateEmail = (input: string): boolean | string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(input)) {
    return 'Please enter a valid email address'
  }
  return true
}

const validatePassword = (input: string): boolean | string => {
  const minLength = 8
  const hasLowerCase = /[a-z]/.test(input)
  const hasUpperCase = /[A-Z]/.test(input)
  const hasNumber = /\d/.test(input)

  const errors = []
  if (input.length < minLength) errors.push(`at least ${minLength} characters`)
  if (!hasLowerCase) errors.push('a lowercase letter')
  if (!hasUpperCase) errors.push('an uppercase letter')
  if (!hasNumber) errors.push('a number')

  if (errors.length > 0) {
    return `Password must contain ${errors.join(', ')}`
  }
  return true
}

export default class UserCommand extends Command {
  static override args = {
    action: Args.string({
      description: 'The action to perform',
      options: ['create', 'update-password'],
      required: true,
    }),
  }

  static override description = 'Manage OwnStats user'

  private async promptUserCredentials(isNewUser = false) {
    const questions = [
      {
        type: 'input',
        name: 'email',
        message: 'Enter email address for your admin user:',
        validate: validateEmail,
      },
      {
        type: 'password',
        name: 'password',
        message: isNewUser ? 'Enter new password:' : 'Enter current password:',
        validate: validatePassword,
      },
    ]

    if (!isNewUser) {
      questions.push({
        type: 'password',
        name: 'newPassword',
        message: 'Enter new password:',
        validate: validatePassword,
      })
    }

    return inquirer.prompt<{
      email: string
      password: string
      newPassword?: string
    }>(questions as any)
  }

  async run(): Promise<void> {
    const { args } = await this.parse(UserCommand)
    const action = args.action as UserAction

    if (!isProjectFolder()) {
      throw new Error("The 'ownstats user' command can only be run in a bootstrapped installation folder! Exiting...")
    }

    // Get storage
    const storage = new StorageHelper({ configDir: process.cwd(), isProject: true })
    
    const userPoolId = storage.get('cognito.userPoolId')
    const clientId = storage.get('cognito.userPoolClientId')
    const profile = storage.get('aws.profile')
    const region = storage.get('aws.region')
    
    if (!userPoolId || !clientId) {
      throw new Error('Cognito configuration not found. Please deploy the backend stack first.')
    }

    const credentials = fromIni({profile: profile})
    const cognitoClient = new CognitoIdentityProviderClient({
      credentials,
      region: region,
    })

    if (action === 'create') {
      const { email, password } = await this.promptUserCredentials(true)

      try {
        ux.action.start('Creating user')
        
        const r1 = await cognitoClient.send(new AdminCreateUserCommand({
          UserPoolId: userPoolId,
          Username: email,
          UserAttributes: [
            {
              Name: 'email',
              Value: email,
            },
            {
              Name: 'email_verified',
              Value: 'true',
            },
          ],
          MessageAction: 'SUPPRESS',
        }))

        const r2 = await cognitoClient.send(new AdminSetUserPasswordCommand({
          UserPoolId: userPoolId,
          Username: email,
          Password: password,
          Permanent: true,
        }))

        ux.action.stop('User created successfully!')
      } catch (error) {
        ux.action.stop('Failed!')
        throw error
      }
    } else if (action === 'update-password') {
      const { email, password, newPassword } = await this.promptUserCredentials(false)

      try {
        ux.action.start('Updating password')

        const authResponse = await cognitoClient.send(new AdminInitiateAuthCommand({
          UserPoolId: userPoolId,
          ClientId: clientId,
          AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        }))

        if (!authResponse.Session) {
          throw new Error('Authentication failed')
        }

        await cognitoClient.send(new AdminRespondToAuthChallengeCommand({
          UserPoolId: userPoolId,
          ClientId: clientId,
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          ChallengeResponses: {
            USERNAME: email!,
            NEW_PASSWORD: newPassword!,
          },
          Session: authResponse.Session!,
        }))

        ux.action.stop('Password updated successfully!')
      } catch (error) {
        ux.action.stop('Failed!')
        throw error
      }
    }
  }
} 