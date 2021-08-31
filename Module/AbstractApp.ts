import { Configuration } from 'intiv/utils/Configuration';
import { EventBus } from 'intiv/utils/EventBus';
import { Inject } from 'intiv/utils/ObjectManager';
import ModuleLoader from 'intiv/core/Loader/ModuleLoader';
import ServiceLoader from 'intiv/core/Loader/ServiceLoader';


export default abstract class AbstractApp
{

    @Inject()
    public configuration : Configuration;

    @Inject()
    public eventBus : EventBus;

    @Inject()
    public serviceLoader : ServiceLoader;

    @Inject()
    public moduleLoader : ModuleLoader;

    public async run()
    {
        // load configuration
        const configData = require('config/configuration').default;
        this.configuration.load(configData);

        // load services
        await this.serviceLoader.load();

        // load entries
        this.moduleLoader.load(['Domain/Repository', 'Domain/Model', 'Observer', 'Controller', 'Service']);

        // run
        await this.main()
    }

    protected abstract main();

}
