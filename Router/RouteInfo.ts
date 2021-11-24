import { Initializable, Initialize } from 'intiv/utils/Initializable';
import { RequestMethod } from 'intiv/core/Router/def';
import express from 'express';


export type RouteOptions = {
    method : RequestMethod,
    arguments? : { [key: string]: any },
    middlewares? : express.RequestHandler[],
}


@Initialize()
export default class RouteInfo
    extends Initializable<RouteInfo>
{
    
    public path : string;
    public controllerMethod : string;
    public options : RouteOptions;
    
}
