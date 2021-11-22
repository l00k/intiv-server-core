import RouteInfo, { RouteOptions } from 'intiv/core/Router/RouteInfo';
import { RouteSymbol } from 'intiv/core/Router/def';


export default function Route(path : string, options ? : RouteOptions)
{
    return (Target : any, method : string) => {
        if (!Target[RouteSymbol]) {
            Target[RouteSymbol] = [];
        }

        let route = new RouteInfo({
            path,
            controllerMethod: method,
            options,
        });

        Target[RouteSymbol].push(route);
    };
}
