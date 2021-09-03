import ModuleLoader from 'intiv/core/Loader/ModuleLoader';
import { ObjectManager, Inject } from 'intiv/utils/ObjectManager';
import _ from 'lodash';


export default class ServiceLoader
{

    @Inject()
    protected moduleLoader : ModuleLoader;


    public async load()
    {
        const objectManager = ObjectManager.getSingleton();

        // modules services
        const moduleServices = await this.moduleLoader.loadFilePerModule('etc/services.ts');

        for (let [moduleName, servicesPackage] of Object.entries(moduleServices)) {
            const moduleCode = _.camelCase(moduleName);
            const servicesList = (<any>servicesPackage).default;

            for (let [serviceName, serviceGetter] of Object.entries(servicesList)) {
                const serviceCode = `@${moduleCode}/${serviceName}`;
                const service = await (<Function> serviceGetter)();

                objectManager.bindService(service, serviceCode);
            }
        }

        // global services
        const services = require('etc/services.ts').default;

        for (let [name, service] of Object.entries(services)) {
            service = await (<Function> service)();
            objectManager.bindService(service, name);
        }
    }

}
