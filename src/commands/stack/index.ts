import { Command, Args } from '@oclif/core'
import { ux } from '@oclif/core'
import StorageHelper from '../../helpers/storage'
import { runServerlessCommand, runNpmCommand, isProjectFolder } from '../../helpers/utils'
import { 
  checkDeploymentBucket, 
  createDeploymentBucket, 
  deleteDeploymentBucket,
  getStackOutputs 
} from '../../helpers/aws'
import { persistConfig } from '../../helpers/config'

const allowedStackNames = ['frontend', 'backend', 'client']
type StackName = typeof allowedStackNames[number]
type StackAction = 'deploy' | 'package' | 'remove' | 'sync' | 'build'

interface BucketParams {
  projectId: string
  region: string
  stage: string
  profile: string
}

export default class StackCommand extends Command {
  static override args = {
    action: Args.string({
      description: 'The action to perform',
      options: ['deploy', 'package', 'remove', 'sync', 'build'],
      required: true,
    }),
    name: Args.string({
      name: 'name',
      options: allowedStackNames as string[],
      required: true,
      description: 'The stack name'
    }),
  }

  static override description = 'Interact with OwnStats stacks within an installation'

  async run(): Promise<void> {
    const { args } = await this.parse(StackCommand)
    const action = args.action as StackAction
    const stackName = args.name as StackName

    if (!isProjectFolder()) {
      throw new Error("The 'ownstats stack' command can only be run in a bootstrapped installation folder! Exiting...")
    }

    // Get storage
    const storage = new StorageHelper({ configDir: process.cwd(), isProject: true })

    // Get bucket params
    const bucketParams: BucketParams = {
      projectId: storage.get('id'),
      region: storage.get('aws.region'),
      stage: storage.get('aws.stage'),
      profile: storage.get('aws.profile')
    }

    if (action === 'deploy') {
      if (stackName === 'backend') {
        const bucketExists = await checkDeploymentBucket(bucketParams)

        if (!bucketExists) {
          ux.action.start('Creating deployment bucket')
          const { bucketName, region } = await createDeploymentBucket(bucketParams)
          ux.action.stop(`Bucket '${bucketName}' in region '${region}' created!`)
        }

        await runServerlessCommand(`${process.cwd()}/${stackName}`, action)
        storage.set(`stacksDeployed.${stackName}`, true)

        if (stackName === 'backend') {
          const { UserPoolId, UserPoolClientId, IdentityPoolId, CuratedBucketName, CloudFrontDistributionId, CloudFrontDistributionDomainName, DistributionBucketName, StreamingQueryUrl, ApiUrl, FrontendCloudFrontDistributionId, FrontendCloudFrontDistributionDomainName, FrontendBucketName } = await getStackOutputs({
            ...bucketParams,
            stackName: 'backend',
            outputs: ['UserPoolId', 'UserPoolClientId', 'IdentityPoolId', 'CuratedBucketName', 'CloudFrontDistributionId', 'CloudFrontDistributionDomainName', 'DistributionBucketName', 'StreamingQueryUrl', 'ApiUrl', 'FrontendCloudFrontDistributionId', 'FrontendCloudFrontDistributionDomainName', 'FrontendBucketName']
          })

          storage.set('cognito.userPoolId', UserPoolId)
          storage.set('cognito.userPoolClientId', UserPoolClientId)
          storage.set('cognito.identityPoolId', IdentityPoolId)
          storage.set('backend.s3BucketName', CuratedBucketName)
          storage.set('backend.streamingQueryUrl', StreamingQueryUrl)
          storage.set('backend.apiBaseUrl', ApiUrl)
          storage.set('backend.cdnDistributionId', CloudFrontDistributionId)
          storage.set('backend.cdnDomainName', CloudFrontDistributionDomainName)
          storage.set('backend.cdnBucketName', DistributionBucketName)
          storage.set('frontend.cdnDistributionId', FrontendCloudFrontDistributionId)
          storage.set('frontend.cdnDomainName', FrontendCloudFrontDistributionDomainName)
          storage.set('frontend.cdnBucketName', FrontendBucketName)

          await persistConfig({
            region: storage.get('aws.region'),
            cognito: {
              userPoolId: UserPoolId,
              userPoolClientId: UserPoolClientId,
              identityPoolId: IdentityPoolId
            },
            backend: {
              streamingQueryUrl: StreamingQueryUrl,
              apiUrl: ApiUrl
            },
            cdn: {
              domainName: CloudFrontDistributionDomainName
            },
            s3: {
              bucketName: CuratedBucketName
            }
          }, 'frontend')
        }
      } else {
        throw new Error("The 'ownstats stack deploy' command can only be run for the 'backend' stack! Exiting...")
      }
    } else if (action === 'remove') {
      if (stackName === 'backend') {
        // Remove stack
        await runServerlessCommand(`${process.cwd()}/${stackName}`, action)

        // Delete deployment bucket
        if (storage.get('stacksDeployed.backend') === true) {
          ux.action.start('Deleting deployment bucket')
          const { bucketName, region } = await deleteDeploymentBucket(bucketParams)
          ux.action.stop(`Bucket '${bucketName}' in region '${region}' deleted!`)
        }

        // Reset stack deployed flag
        storage.set(`stacksDeployed.${stackName}`, false)
      } else {
        throw new Error("The 'ownstats stack remove' command can only be run for the 'backend' stack! Exiting...")
      }
    } else if (action === 'package') {
      if (stackName === 'backend') {
        await runServerlessCommand(`${process.cwd()}/${stackName}`, action)
      } else {
        throw new Error("The 'ownstats stack package' command can only be run for the 'backend' stack! Exiting...")
      }
    } else if (action === 'sync') {
      if (['frontend', 'client'].includes(stackName)) {
        await runNpmCommand(`${process.cwd()}/${stackName}`, 'sync')
      } else {
        throw new Error("The 'ownstats stack sync' command can only be run for the 'frontend' stack! Exiting...")
      }
    } else if (action === 'build') {
      if (['frontend', 'client'].includes(stackName)) {
        await runNpmCommand(`${process.cwd()}/${stackName}`, 'build')
      } else {
        throw new Error("The 'ownstats stack build' command can only be run for the 'frontend' or 'client' stack! Exiting...")
      }
    }
  }
}