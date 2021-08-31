import { ObjectManager } from 'intiv/utils/ObjectManager';
import { isArrowFunction } from 'intiv/utils/Utility';


type Callback = (data : any, previousResult : any) => any;

type Listners = {
    [eventName : string] : Callback[]
};


class ServiceLoader
{

    public async load()
    {
        const services = require('config/services').default;

        for (let [name, service] of Object.entries(services)) {
            service = await (<Function> service)();
            ObjectManager.bindService(service, name);
        }
    }

}


export default ServiceLoader;
