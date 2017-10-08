import * as childProcess from 'child_process';

/**
 * Executes the given command, returning a promise
 * for a successful, non-zero status code completion.
 * Otherwise rejects with an error.
 *
 * The standard/error output is printed to the console.
 *
 * @param cmd The command to execute
 */
export function execute(cmd: string, log= true): Promise<string> {
    return new Promise((resolve, reject) => {
        childProcess.exec(cmd, (error, stdout, stderr) => {
            if (log && stdout) {
                // tslint:disable-next-line:no-console
                console.log(stdout);
            }
            if (log && stderr) {
                // tslint:disable-next-line:no-console
                console.error(stderr);
            }
            error ? reject(error) : resolve(stdout.trim());
        });
    });
}

/**
 * Escapes the string for shell.
 */
export function escapeForShell(...a: string[]): string {
    const ret: string[] = [];
    a.forEach((s) => {
        if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
            s = '\'' + s.replace(/'/g, '\'\\\'\'') + '\'';
            s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
                .replace(/\\'''/g, '\\\''); // remove non-escaped single-quote if there are enclosed between 2 escaped
        }
        ret.push(s);
    });
    return ret.join(' ');
}
