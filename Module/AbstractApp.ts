import { Configuration } from 'intiv/utils/Configuration';
import { EventBus } from 'intiv/utils/EventBus';
import { Inject, ObjectManager } from 'intiv/utils/ObjectManager';
import ModuleLoader from 'intiv/core/Loader/ModuleLoader';
import ServiceLoader from 'intiv/core/Loader/ServiceLoader';
import _ from 'lodash';
import * as fs from 'fs';
import path from 'path';
import { Logger } from 'intiv/utils/Utility';


export default abstract class AbstractApp
{

    
    @Inject({ ctorArgs: [ 'App' ] })
    protected logger : Logger;

    @Inject()
    protected eventBus : EventBus;

    @Inject()
    protected serviceLoader : ServiceLoader;

    @Inject()
    protected moduleLoader : ModuleLoader;


    public async run()
    {
        // load configuration
        await this.loadConfigData();

        // register configuration under object manager handlers
        const configuration = Configuration.getSingleton();
        ObjectManager.getSingleton()
            .registerHandler(configuration.injectConfigurationValues.bind(configuration));

        // load services
        await this.serviceLoader.load();

        // load entries
        this.moduleLoader.load(['Domain/Repository', 'Domain/Model', 'Observer', 'Controller', 'Service']);

        // run
        await this.main()
    }

    protected async loadConfigData()
    {
        const configuration = Configuration.getSingleton();

        // per module configuration
        const moduleConfigPackages = await this.moduleLoader.loadFilePerModule('etc/config.ts');

        Object.entries(moduleConfigPackages)
            .forEach(([moduleName, moduleConfigPackage]) => {
                const moduleCode = _.camelCase(moduleName);
                const configData = (<any>moduleConfigPackage).default;
                configuration.load(configData, `module.${moduleCode}`);
            });

        // global configuration
        {
            const configData = require('etc/config.ts').default;
            configuration.load(configData);
        }

        // global deployment configuration
        const baseDir = globalThis['__basedir'];
        const deploymentConfigPath = path.join(baseDir, `etc/local/config.ts`);
        
        const exists = fs.existsSync(deploymentConfigPath);
        if (exists) {
            this.logger.log('Loading deployment configuration');
        
            const configData = require(deploymentConfigPath).default;
            if (configData) {
                configuration.load(configData);
            }
        }

        // global on request run context configuration
        const runContext = process.env.RUN_CONTEXT;
        if (runContext) {
            const baseDir = globalThis['__basedir'];
            const runContextConfigPath = path.join(baseDir, `etc/contexts/${runContext}/config.ts`);
            
            const exists = fs.existsSync(runContextConfigPath);
            if (exists) {
                this.logger.log('Loading run context configuration');
                
                const configData = require(runContextConfigPath).default;
                if (configData) {
                    configuration.load(configData);
                }
            }
        }
    }

    protected abstract main();

}
