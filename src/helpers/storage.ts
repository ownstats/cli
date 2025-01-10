import fs from 'fs-extra';
import { join } from 'path';
import nestedProperty from 'nested-property';
import globals from './globals';

export default class StorageHelper {
  private configFilePath: string;
  private config: Record<string, any>;

  constructor({ configDir, isProject = true }: { configDir: string, isProject: boolean }) {
    this.configFilePath = join(configDir, isProject ? globals.projectFileName : globals.globalConfigFileName);
    this.config = this.readConfig();
  }

  readConfig () {
    if (!fs.existsSync(this.configFilePath)) {
      fs.ensureFileSync(this.configFilePath);
      fs.writeJSONSync(this.configFilePath, {});
    }
    return fs.readJsonSync(this.configFilePath);
  }

  persistConfig () {
    // Persist in filesystem
    fs.writeJSONSync(this.configFilePath, this.config, { spaces: 2, replacer: undefined });
  }

  getCurrentConfig () {
    return this.config;
  }

  get (propertyPath: string) {
    return nestedProperty.get(this.config, propertyPath);
  }

  set (propertyPath: string, value: any) {
    // Set actual property
    nestedProperty.set(this.config, propertyPath, value);
    // Set updatedTimestamp property
    nestedProperty.set(this.config, 'lastUpdatedTimestamp', new Date().toISOString());
    // Persist
    this.persistConfig();
  }

  reset () {
    this.config = {};
    this.persistConfig();
  }
}
