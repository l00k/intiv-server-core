import express from 'express';
import Controller from 'intiv/core/Module/AbstractController';
import { EventBus } from 'intiv/utils/EventBus';
import { Inject, ObjectManager } from 'intiv/utils/ObjectManager';
import { ValidationException } from 'intiv/utils/Validator';
import { Exception } from '../Exception';
import RouteInfo, { RouteOptions } from './RouteInfo';
import { Logger } from 'intiv/utils/Utility';
import ActionResult from 'intiv/core/Router/ActionResult';
import { ClassConstructor } from 'intiv/utils/ObjectManager/def';
import _ from 'lodash';


const env = process.env.NODE_ENV || 'production';


type RouteDscr = {
    controller : Controller,
    action : string,
    options : RouteOptions
};

type RouteCallback = (
    parameters ? : { [field : string] : any },
    body ? : any
) => boolean;


export default class Router
{
    
    @Inject({ ctorArgs: [ Router.name ] })
    protected logger : Logger;
    
    @Inject()
    protected eventBus : EventBus;
    
    protected controllers : Map<any, Controller> = new Map();
    protected routes : { [path : string] : RouteDscr } = {};
    
    
    public registerRoute (CtrlClass : ClassConstructor<Controller>, route : RouteInfo)
    {
        const objectManager = ObjectManager.getSingleton();
        
        if (!this.controllers.has(CtrlClass)) {
            const instance = objectManager.getInstance(CtrlClass);
            this.controllers.set(CtrlClass, instance);
        }
        
        const instance = this.controllers.get(CtrlClass);
        
        this.routes[route.path] = {
            controller: instance,
            action: route.controllerMethod,
            options: route.options,
        };
    }
    
    public bindExpress (express : express.Application)
    {
        for (let path in this.routes) {
            let routeDscr = this.routes[path];
            express[routeDscr.options.method](
                path,
                async(request, response) => this.handleRequest(path, request, response)
            );
        }
    }
    
    protected async handleRequest (
        route : string,
        request : express.Request,
        response : express.Response
    )
    {
        const routeDscr = this.routes[route];
        
        // collect parameters
        let parameters : {} = {};
        
        if (!Object.values(request.params)) {
            Object.assign(parameters, request.params);
        }
        if (!_.isEmpty(request?.query)) {
            Object.assign(parameters, request.query);
        }
        
        // handle route
        const controller : Controller = routeDscr.controller;
        
        try {
            const result : any = await controller[routeDscr.action](parameters, request.body);
            
            // prepared result
            if (result instanceof ActionResult) {
                response.status(result.code);
                response.json(result.payload);
            }
            // inline json result
            else if (typeof result != 'undefined') {
                response.status(200);
                response.json(result);
            }
        }
        catch (exception) {
            // prepared result
            if (exception instanceof ActionResult) {
                response.status(exception.code);
                response.json(exception.payload);
            }
            // validation exception
            else if (exception instanceof ValidationException) {
                response.status(exception.metadata.responseCode);
                response.json({
                    exception: exception.name,
                    code: exception.code,
                    details: exception.details,
                });
            }
            // generic exception
            else if (exception instanceof Exception) {
                response.status(exception.metadata.responseCode);
                response.json({
                    exception: exception.name,
                    message: exception.message,
                    code: exception.code,
                });
            }
            // default error handling
            else {
                response.contentType('text/plain');
                response.status(500);
                
                let msg = 'Internal error!\n';
                
                msg += env == 'development'
                    ? exception
                    : 'Code: ' + (<any>exception).code;
                
                if (env == 'development') {
                    msg += '\n\n\n' + (<any>exception).stack;
                }
                
                response.send(msg);
                
                this.logger.error(`### Error 500\n${exception}`);
            }
        }
        
        response.end();
    }
    
}
