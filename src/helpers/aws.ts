import { S3Client, HeadBucketCommand, CreateBucketCommand, DeleteObjectsCommand, DeleteBucketCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { fromIni } from '@aws-sdk/credential-providers';

interface DeploymentBucketNameParams {
  projectId: string;
  stage: string;
}

interface DeploymentBucketParams {
  projectId: string;
  region: string;
  stage: string;
  profile: string;
}

interface StackOutputParams extends DeploymentBucketParams {
  stackName: string;
  outputs: string[];
}

export function getDeploymentBucketName({ projectId, stage }: DeploymentBucketNameParams) {
  return `ownstats-${projectId}-deploymentbucket-${stage}`;
}

export async function checkDeploymentBucket({ projectId, region = 'us-east-1', stage = 'prd', profile = 'default' }: DeploymentBucketParams) {
  try {
    const s3Client = new S3Client({
      region,
      credentials: fromIni({ profile })
    });

    await s3Client.send(new HeadBucketCommand({
      Bucket: getDeploymentBucketName({ projectId, stage })
    }));
    return true;
  } catch (err) {
    return false;
  }
}

export async function createDeploymentBucket({ projectId, region = 'us-east-1', stage = 'prd', profile = 'default' }: DeploymentBucketParams) {
  const s3Client = new S3Client({
    region,
    credentials: fromIni({ profile })
  });

  const bucketName = getDeploymentBucketName({ projectId, stage });
  const parameters: any = {
    Bucket: bucketName,
    ACL: 'private',
  };

  if (region !== 'us-east-1') {
    parameters.CreateBucketConfiguration = {
      LocationConstraint: region,
    };
  }

  await s3Client.send(new CreateBucketCommand(parameters));

  return {
    bucketName,
    region,
  };
}

export async function deleteDeploymentBucket({ projectId, region = 'us-east-1', stage = 'prd', profile = 'default' }: DeploymentBucketParams) {
  const s3Client = new S3Client({
    region,
    credentials: fromIni({ profile })
  });

  const bucketName = getDeploymentBucketName({ projectId, stage });
  
  const listResult = await s3Client.send(new ListObjectsCommand({ Bucket: bucketName }));

  if (listResult.Contents && listResult.Contents.length > 0) {
    await s3Client.send(new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: listResult.Contents.map(({ Key }) => ({ Key: Key! }))
      }
    }));
  }

  await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));

  return {
    bucketName,
    region,
  };
}

export async function getStackOutputs({ projectId, stackName, outputs = [], region = 'us-east-1', stage = 'prd', profile = 'default' }: StackOutputParams) {
  const cfClient = new CloudFormationClient({
    region,
    credentials: fromIni({ profile })
  });

  const stackInfo = await cfClient.send(new DescribeStacksCommand({
    StackName: `ownstats-${projectId}-${stackName}-${stage}`,
  }));

  const stackOutputs = stackInfo.Stacks?.[0]?.Outputs ?? [];
  const foundOutputs: Record<string, string> = {};
  
  stackOutputs
    .filter((output) => outputs.includes(output.OutputKey!))
    .forEach((output) => {
      foundOutputs[output.OutputKey!] = output.OutputValue!;
    });
  
  return foundOutputs;
}
