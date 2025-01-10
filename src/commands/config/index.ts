import { Command, Flags, Args } from '@oclif/core'
import StorageHelper from '../../helpers/storage'
import { isProjectFolder } from '../../helpers/utils'

type ConfigAction = 'get' | 'set'
type ConfigProperty = 'aws-stage' | 'aws-region' | 'aws-profile'

export default class ConfigCommand extends Command {
  static override description = 'Configure the project settings'

  static override args = {
    action: Args.string({
      description: 'The action to perform',
      options: ['get', 'set'],
      required: true,
    }),
    property: Args.string({
      description: 'The property to configure',
      options: ['aws-stage', 'aws-region', 'aws-profile'],
      required: true,
    }),
    value: Args.string({
      description: 'The configuration value',
      required: false,
    }),
  }

  static override flags = {
    json: Flags.boolean({
      char: 'j',
      description: 'Show output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigCommand)
    const action = args.action as ConfigAction
    const property = args.property as ConfigProperty
    const value = args.value

    if (!isProjectFolder()) {
      throw new Error('This command can only be run in a project folder! Exiting...')
    }

    const storage = new StorageHelper({ configDir: process.cwd(), isProject: true })

    if (action === 'set') {
      
      if (!value) {
        throw new Error('A property value needs to be specified!')
      }

      switch (property) {
        case 'aws-region':
          storage.set('aws.region', value)
          break
        case 'aws-stage':
          storage.set('aws.stage', value)
          break
        case 'aws-profile':
          storage.set('aws.profile', value)
          break
      }
    } else if (action === 'get') {
      try {
        let output: { [key: string]: string | string[] }

        switch (property) {
          case 'aws-region':
            output = { region: storage.get('aws.region') }
            break
          case 'aws-stage':
            output = { stage: storage.get('aws.stage') }
            break
          case 'aws-profile':
            output = { profile: storage.get('aws.profile') }
            break
        }

        if (flags.json) {
          this.log(JSON.stringify(output))
        } else {
          const value = Object.values(output)[0]
          this.log(Array.isArray(value) ? value.join(', ') : value)
        }
      } catch (err) {
        if (err instanceof Error) {
          this.log(err.message)
        } else {
          this.log('An unknown error occurred')
        }
      }
    }
  }
} 