#! /usr/bin/env node
import chalk from 'chalk';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as yargs from 'yargs';
import { ICommandOptions, readConfig } from './config';
import { escapeForShell } from './exec';

// Allow loading TypeScript (.ts) files using `require()` commands
import 'ts-node/register';

// Polyfill Symbol.asyncIterator
(Symbol as any).asyncIterator = (Symbol as any).asyncIterator || Symbol.for('Symbol.asyncIterator');

const onError = (error: Error) => {
    process.exitCode = 1;
    // tslint:disable-next-line:no-console
    console.error(chalk.red(String(error.stack || error)));
};
const errorHandler = {
    error: onError,
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
        command: 'init [directory]',
        aliases: ['update', 'pull'],
        builder: (cmdYargs) => cmdYargs
            .default('directory', process.cwd())
            .normalize('directory')
            .describe('template', 'Name of the Broilerplate branch to apply.')
            .default('template', 'master')
        ,
        describe: 'Initializes/updates your project to use the Broilerplate template.',
        handler: ({template, directory}: {template: string, directory: string}) => {
            const options: childProcess.ExecSyncOptions = {cwd: directory, stdio: 'inherit'};
            childProcess.execSync(`git init ${escapeForShell(directory)}`, options);
            childProcess.execSync(`git pull https://github.com/ktkiiski/broilerplate.git ${escapeForShell(template)} --allow-unrelated-histories`, options);
            childProcess.execSync(`npm install`, options);
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
            if ('initialize$' in broiler) {
                (argv.init ? broiler.initialize$() : broiler.deploy$()).subscribe(errorHandler);
            } else {
                (argv.init ? broiler.initialize() : broiler.deploy()).then(null, onError);
            }
        },
    })
    .command({
        command: 'undeploy <stage>',
        describe: 'Deletes the previously deployed web app for the given stage.',
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            if ('undeploy$' in broiler) {
                broiler.undeploy$().subscribe(errorHandler);
            } else {
                broiler.undeploy().then(null, onError);
            }
        },
    })
    .command({
        command: 'compile <stage>',
        aliases: ['build'],
        describe: 'Compile the web app for the given stage.',
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            if ('compile$' in broiler) {
                broiler.compile$().subscribe(errorHandler);
            } else {
                broiler.compile().then(null, onError);
            }
        },
    })
    .command({
        command: 'preview <stage>',
        describe: 'Preview the changes that would be deployed without actually deploying them.',
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            if ('preview$' in broiler) {
                broiler.preview$().subscribe(errorHandler);
            } else {
                broiler.preview().then(null, onError);
            }
        },
    })
    .command({
        command: 'describe <stage>',
        describe: 'Describes the deployed resources of the given stage.',
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            if ('printStack$' in broiler) {
                broiler.printStack$().subscribe(errorHandler);
            } else {
                broiler.printStack().then(null, onError);
            }
        },
    })
    .command({
        command: 'serve [stage]',
        describe: 'Run the local development server',
        builder: (cmdYargs) => cmdYargs.default('stage', 'local'),
        handler: (argv: ICommandOptions) => {
            const config = readConfig(argv);
            const broiler = getBroiler(config);
            if ('serve$' in broiler) {
                broiler.serve$().subscribe(errorHandler);
            } else {
                broiler.serve().then(null, onError);
            }
        },
    })
    .demandCommand(1)
    .wrap(Math.min(yargs.terminalWidth(), 140))
    .help()
    .version()
    .argv
;
