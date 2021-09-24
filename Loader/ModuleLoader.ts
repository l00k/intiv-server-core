import { InitiationException } from 'intiv/utils/Exception';
import path from 'path';
import glob from 'glob';


export default class ModuleLoader
{

    public load<T>(types : string[]): T[]
    {
        const modules = [];
        const baseDir = globalThis['__basedir'];

        for (const type of types) {
            glob.sync(`modules/*/${type}/**/*.ts`, { cwd: baseDir })
                .forEach((path) => {
                    modules.push(require(path).default);
                });
        }

        return modules;
    }

    public async loadFilePerModule(file : string)
    {
        const files : any = {};

        const baseDir = globalThis['__basedir'];
        glob.sync(`modules/*/${file}`, { cwd: baseDir })
            .forEach((path) => {
                const pathParts = path.replace(/^[./]+/g, '').split('/');
                pathParts.shift();
                const moduleName = pathParts.shift();

                files[moduleName] = require(path);
            });

        return files;
    }

}
