import {Command, Flags} from '@oclif/core'
import {STSClient, GetCallerIdentityCommand} from '@aws-sdk/client-sts'
import {fromIni} from '@aws-sdk/credential-providers'

export default class Verify extends Command {
  static override description = 'Verify AWS credentials'

  static override examples = [
    `<%= config.bin %> <%= command.id %> --profile default
Verifying AWS credentials...
Successfully authenticated with AWS using profile: default
`,
  ]

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'AWS profile to use',
      default: 'default',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Verify)

    this.log('Verifying AWS credentials...')

    try {
      const credentials = fromIni({profile: flags.profile})
      const client = new STSClient({
        credentials,
        region: 'us-east-1', // Default region for identity check
      })

      const command = new GetCallerIdentityCommand({})
      const response = await client.send(command)

      this.log(`Successfully authenticated with AWS using profile: ${flags.profile}`)
      this.log(`Account: ${response.Account}`)
      this.log(`User: ${response.Arn}`)
    } catch (error) {
      this.error('Failed to authenticate with AWS', {
        suggestions: [
          'Make sure your AWS credentials are properly configured in ~/.aws/credentials',
          'Verify that the specified profile exists',
          'Run "aws configure" to set up your credentials',
        ],
      })
    }
  }
} 