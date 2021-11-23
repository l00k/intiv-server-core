import RouteInfo, { RouteOptions } from 'intiv/core/Router/RouteInfo';
import { ObjectManager } from 'intiv/utils/ObjectManager';
import Router, { RequestMethod } from 'intiv/core/Router';


function Route (path : string, options ? : RouteOptions)
{
    return (Target : any, method : string) => {
        const router = ObjectManager.getSingleton()
            .getInstance(Router);
        
        const routeInfo = new RouteInfo({
            path,
            controllerMethod: method,
            options: {
                method: RequestMethod.GET,
                ...options
            },
        });
        
        router.registerRoute(Target, routeInfo);
    };
}

Route.GET = (path : string, options ? : RouteOptions) => {
    return Route(path, { method: RequestMethod.GET, ...options });
}

Route.PUT = (path : string, options ? : RouteOptions) => {
    return Route(path, { method: RequestMethod.PUT, ...options });
}

Route.POST = (path : string, options ? : RouteOptions) => {
    return Route(path, { method: RequestMethod.POST, ...options });
}

Route.PATCH = (path : string, options ? : RouteOptions) => {
    return Route(path, { method: RequestMethod.PATCH, ...options });
}

Route.DELETE = (path : string, options ? : RouteOptions) => {
    return Route(path, { method: RequestMethod.DELETE, ...options });
}


export {
    Route
};
