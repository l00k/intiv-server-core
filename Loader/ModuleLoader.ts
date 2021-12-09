import { InitiationException } from 'intiv/utils/Exception';
import path from 'path';
import glob from 'glob';
import _ from 'lodash';


export type ModuleDescription = {
    priority: number,
    code: string,
};


export default class ModuleLoader
{

    protected modules : { [moduleName: string] : ModuleDescription } = {};


    public async loadModules()
    {
        if (!this.modules) {
            const modules = await this.loadFilePerModule('etc/module.ts');
            this.modules = Object.fromEntries(
                Object.entries(modules)
                    .sort((a, b) => a[1].priority < b[1].priority ? -1 : 1)
            );
            
            for (const moduleName in this.modules) {
                this.modules[moduleName] = {
                    code: _.camelCase(moduleName),
                    ...this.modules[moduleName],
                }
            }
        }
        
        return this.modules;
    }
    

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

    public async loadFilePerModule(file : string) : Promise<{ [moduleName : string]: any }>
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
