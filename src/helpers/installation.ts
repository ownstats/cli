import { writeFileSync } from 'fs-extra';
import globals from './globals';
import degit from 'degit';

export async function createProjectFile (projectName: string, targetDir: string, versionNumber = '0.0.1') {
  const timestamp = new Date().toISOString();

  const template = {
    id: Math.random().toString(36).substr(2, 8),
    name: projectName,
    version: versionNumber,
    createdTimestamp: timestamp,
    lastUpdatedTimestamp: timestamp,
    dependenciesInstalledTimestamp: null, 
    aws: {
      stage: 'prd',
      region: 'us-east-1',
      profile: 'default',
    },
    stacksDeployed: {
      backend: false,
    },
    cognito: {},
    frontend: {},
    backend: {}
  }

  writeFileSync(`${targetDir}/${globals.projectFileName}`, JSON.stringify(template, null, 2));
}

export async function cloneRepo (targetDirectory: string): Promise<void> {
  const repo = degit('github:ownstats/ownstats#main', {
    cache: false,
    force: true,
    verbose: true,
    mode: 'git',
  });

  await repo.clone(targetDirectory);
}
