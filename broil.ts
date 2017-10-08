#! /usr/bin/env node
import { red } from 'chalk';
import * as path from 'path';
import * as yargs from 'yargs';
import { ICommandOptions, readConfig } from './config';
import { escapeForShell, execute } from './exec';

// Allow loading TypeScript (.ts) files using `require()` commands
import 'ts-node/register';

const errorHandler = {
    error: (error: Error) => {
        process.exitCode = 1;
        // tslint:disable-next-line:no-console
        console.error(red(String(error.stack || error)));
    },
};

function getBroiler(config: any): any {
    const projectRoot = process.cwd();
    const broilerModulePath = path.resolve(projectRoot, './node_modules/broilerkit/broiler');
    const broilerModule = require(broilerModulePath);
    const Broiler = broilerModule.Broiler;
    return new Broiler(config);
}

// tslint:disable-next-line:no-unused-expression
yargs
    // Read the app configuration
    .describe('appConfigPath', 'Path to the app configuration')
    .default('appConfigPath', './app.config.ts')
    .alias('appConfigPath', 'appConfig')
    .normalize('appConfigPath')

    .boolean('debug')
    .describe('debug', 'Compile assets for debugging')

    .boolean('no-color')
    .describe('no-color', 'Print output without colors')

    /**** Commands ****/
    .command({
        command: 'init [branch]',
        aliases: ['update', 'pull'],
        builder: (cmdYargs) => cmdYargs.default('branch', 'master'),
        describe: 'Initializes/updates your project to use the Broilerplate template.',
        handler: ({branch}: {branch: string}) => {
            execute(`git pull https://github.com/ktkiiski/broilerplate.git ${escapeForShell(branch)} --allow-unrelated-histories`)
                .then(null, errorHandler.error)
            ;
        },
    })
    .command({
        command: 'deploy <stage>',
        describe: 'Deploy the web app for the given stage.',
        builder: (cmdYargs) => cmdYargs
            .boolean('init')
            .describe('init', 'Just create a stack without deploying')
        ,
        handler: (argv: ICommandOptions & {init: boolean}) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            (argv.init ? broiler.initialize$() : broiler.deploy$()).subscribe(errorHandler);
        },
    })
    .command({
        command: 'undeploy <stage>',
        describe: 'Deletes the previously deployed web app for the given stage.',
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            broiler.undeploy$().subscribe(errorHandler);
        },
    })
    .command({
        command: 'compile <stage>',
        aliases: ['build'],
        describe: 'Compile the web app for the given stage.',
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            broiler.compile$().subscribe(errorHandler);
        },
    })
    .command({
        command: 'preview <stage>',
        describe: 'Preview the changes that would be deployed without actually deploying them.',
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            broiler.preview$().subscribe(errorHandler);
        },
    })
    .command({
        command: 'describe <stage>',
        describe: 'Describes the deployed resources of the given stage.',
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            broiler.printStack$().subscribe(errorHandler);
        },
    })
    .command({
        command: 'serve [stage]',
        describe: 'Run the local development server',
        builder: (cmdYargs) => cmdYargs.default('stage', 'local'),
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            broiler.serve$().subscribe(errorHandler);
        },
    })
    .demandCommand(1)
    .wrap(Math.min(yargs.terminalWidth(), 140))
    .help()
    .version()
    .argv
;
