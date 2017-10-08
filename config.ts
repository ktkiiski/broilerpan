import * as path from 'path';

export interface ICommandOptions {
    appConfigPath: string;
    stage: string;
    debug: boolean;
}

export function readConfig(options: ICommandOptions): any {
    const { stage, appConfigPath, debug } = options;
    const cwd = process.cwd();
    const appConfig = require(path.resolve(cwd, appConfigPath));
    const projectRoot = path.dirname(appConfigPath);
    const {stages, ...siteConfig} = appConfig;
    const stageConfig = stages[stage];
    const buildDir = path.join('./.broiler/build', stage || 'local');
    const stackName = `${siteConfig.name}-${stage}`;
    const config = {
        ...siteConfig,
        ...stageConfig,
        debug,
        projectRoot,
        buildDir,
        stage,
        stackName,
    };
    // No api defined?
    if (!config.apiPath) {
        return config;
    }
    return {
        ...config,
        api: require(path.resolve(projectRoot, config.apiPath)),
    };
}
