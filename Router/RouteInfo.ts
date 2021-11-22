import { Initializable, Initialize } from 'intiv/utils/Initializable';
import { RouteMethod } from 'intiv/core/Router/def';


export type RouteOptions = {
    method : RouteMethod,
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
