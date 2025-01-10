import envPaths from 'env-paths';
import bunyan, { LogLevelString } from 'bunyan';
import { ensureDirSync, ensureFileSync, pathExistsSync } from 'fs-extra';

let loggerInstance: bunyan | null = null;

export default class Logger {
  private logPath: string;
  private historyInDays: number;
  private level: LogLevelString | undefined;

  constructor (options: { logPath?: string, historyInDays?: number, level?: LogLevelString } = {}) {
    this.logPath = options.logPath || envPaths('ownstats-cli').log;
    this.historyInDays = options.historyInDays || 14;
    this.level = options.level || 'debug' as LogLevelString;
    this.ensurePaths();
  }

  ensurePaths () {
    if (!pathExistsSync(this.logPath)) {
      ensureDirSync(this.logPath);
      ensureFileSync(`${this.logPath}/ownstats-cli.log`);
    }
  }

  getInstance() {
    if (!loggerInstance || loggerInstance === null) {
      loggerInstance = bunyan.createLogger({
        name: 'ownstats-cli',
        level: this.level,
        streams: [{
            type: 'rotating-file',
            path: `${this.logPath}/ownstats-cli.log`,
            period: '1d',
            count: this.historyInDays
        }]
      });
    }
    return loggerInstance;
  }
}
