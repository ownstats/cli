import { Command, Flags, Args } from '@oclif/core'
import { isAbsolute, join } from 'path'
import { ensureDir, pathExistsSync } from 'fs-extra'
import { confirm } from '@inquirer/prompts';
import { cloneRepo, createProjectFile } from '../../helpers/installation'

const projectNamePattern = /^[A-Za-z0-9_-]*$/g

export default class InstallationCommand extends Command {
  static override description = 'Create a local Ownstats installation from the repository'

  static override args = {
    action: Args.string({
      description: 'The installation action to perform',
      options: ['create'],
      required: true,
    }),
  }

  static override flags = {
    path: Flags.string({ char: 'p', description: 'An absolute path where a new OwnStats installation shall be created in', required: true }),
    name: Flags.string({ char: 'n', description: 'The name of the installation to create', required: true }),
    createDir: Flags.boolean({ char: 'd', description: "Create directory if it doesn't exist", default: false }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(InstallationCommand)

    // Verify that path is absolute
    if (!isAbsolute(flags.path)) {
      throw new Error('Given --path flag must be an absolute path!')
    }

    if (!pathExistsSync(flags.path) && !flags.createDir) {
      throw new Error(`Path '${flags.path}' doesn't exist, and --createDir flag wasn't specified.`)
    }

    if (!flags.name.match(projectNamePattern)) {
      throw new Error('Valid characters in installation names are uppercase and lowercase characters, numbers, dashes and underscores.')
    }

    if (args.action === 'create') {
      // Set checkout path
      const checkoutPath = join(flags.path, flags.name)

      // Confirm creation
      const confirmCreate = await confirm({
        message: `Shall the new OwnStats installation be created in directory ${checkoutPath}?`,
      })

      if (confirmCreate) {
        // Create directory
        await ensureDir(checkoutPath)

        // Clone repo with local Git
        await cloneRepo(checkoutPath)

        // Create project file
        await createProjectFile(flags.name, checkoutPath)

        this.log(`Successfully bootstrapped a new OwnStats installation to ${checkoutPath}`)
      }
    } else {
      throw new Error('Unspecified action!')
    }
  }
} 