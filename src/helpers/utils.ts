import { pathExistsSync } from 'fs-extra';
import { action } from '@oclif/core/ux';
import { join } from 'path';
import global from './globals';
import Logger from './logger';
import { exec, ExecOptions } from 'child_process';

export function getProjectConfigurationPath () {
  return join(process.cwd(), global.projectFileName);
}

export function isProjectFolder () {
  return pathExistsSync(join(process.cwd(), global.projectFileName));
}

export function getAWSRegions () {
  return ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'af-south-1', 'ap-east-1', 'ap-south-1', 'ap-northeast-3', 'ap-northeast-2', 'ap-northeast-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3', 'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-south-1', 'eu-north-1', 'me-south-1', 'sa-east-1', 'cn-northwest-1', 'cn-north-1', 'us-gov-east-1', 'us-gov-west-1'];
}

export function execAsync(cmd: string, opts: { encoding: "buffer" | null; } & ExecOptions) {
  return new Promise((resolve, reject) => {
    // Instantiate logger
    const logger = new Logger({ logPath: `${process.cwd()}/.ownstats/logs` }).getInstance();

    action.start(`Running '${cmd}' in directory '${opts.cwd}'`);

    // Start process
    const subProcess = exec(cmd, opts, (err, stdout, stderr) => {
      const outMsg = stdout || '';

      if (err) {
        // Stack doesn't exist. Soft failure
        if (outMsg.toString().match(/does not exist/)) {
          return resolve({ stdout, stderr });
        }

        return reject(err);
      }

      return resolve({ stdout, stderr });
    })
    subProcess?.stdout?.on('data', (data) => {
      logger.debug(data.toString());
    })
    subProcess?.stdin?.on('data', (data) => {
      logger.debug(data.toString());
    })
    subProcess?.stderr?.on('data', (data) => {
      logger.debug(data.toString());
    })
    subProcess?.on('exit', (code) => {
      action.stop();
    })
  })
}

export function runServerlessCommand(dir: string, command: string) {
  if (!dir) {
    throw new Error(`Stack directory not provided`);
  }
  const env = {
    ...process.env,
  }

  return execAsync(`sls ${command}`, {
    encoding: null,
    env: env,
    cwd: dir,
  });
}

export function runNpmCommand(dir: string, command: string) {
  if (!dir) {
    throw new Error(`Service directory not provided`);
  }
  const env = {
    ...process.env,
  }

  return execAsync(`npm run ${command}`, {
    encoding: null,
    env: env,
    cwd: dir,
  });
}

export function runNpmInstall(dir: string) {
  if (!dir) {
    throw new Error(`Service directory not provided`);
  }
  const env = {
    ...process.env,
  }

  return execAsync(`npm i`, {
    encoding: null,
    env: env,
    cwd: dir,
  });
}

