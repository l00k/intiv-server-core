import { Initializable, Initialize } from 'intiv/utils/Initializable';
import { RequestMethod } from 'intiv/core/Router/def';


export type RouteOptions = {
    method : RequestMethod,
    arguments? : { [key: string]: any },
}


@Initialize()
export default class RouteInfo
    extends Initializable<RouteInfo>
{
    
    public path : string;
    public controllerMethod : string;
    public options : RouteOptions;
    
}
