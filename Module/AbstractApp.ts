import { Configuration } from 'intiv/utils/Configuration';
import { EventBus } from 'intiv/utils/EventBus';
import { Inject, ObjectManager } from 'intiv/utils/ObjectManager';
import ModuleLoader from 'intiv/core/Loader/ModuleLoader';
import ServiceLoader from 'intiv/core/Loader/ServiceLoader';
import _ from 'lodash';


export default abstract class AbstractApp
{

    @Inject()
    public eventBus : EventBus;

    @Inject()
    public serviceLoader : ServiceLoader;

    @Inject()
    public moduleLoader : ModuleLoader;


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
        const configData = require('etc/config.ts').default;
        configuration
            .load(configData);
    }

    protected abstract main();

}
