import { Configuration } from 'intiv/utils/Configuration';
import { Inject } from 'intiv/utils/ObjectManager';
import { MikroORM } from '@mikro-orm/core';
import bodyParser from 'body-parser';
import { Context } from 'intiv/core/GraphQL';
import ModuleLoader from 'intiv/core/Loader/ModuleLoader';
import AbstractResolver from 'intiv/core/Module/AbstractResolver';
import cors from 'cors';
import express, { Request } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLSchema } from 'graphql';
import http from 'http';
import { ServerOptions } from 'https';
import { buildSchema } from 'type-graphql';
import { Logger } from 'intiv/utils/Utility';
import Router from 'intiv/core/Router';
import colors from 'colors';


export type ExpressConfig = {
    listenOnPort : number,
    httpServerOptions? : ServerOptions,
    useNativeControllers? : boolean,
    useGraphQL? : boolean,
    startGraphQLPlaygroundMiddleware? : boolean,
}


export default class ExpressFactory
{
    
    @Inject({ ctorArgs: [ 'Express' ] })
    protected logger : Logger;
    
    @Inject()
    protected configuration : Configuration;
    
    @Inject()
    protected moduleLoader : ModuleLoader;
    
    @Inject()
    protected router : Router;
    
    @Inject({ name: 'orm' })
    protected orm : MikroORM;
    
    
    public async create (config : ExpressConfig) : Promise<express.Application>
    {
        config = {
            useNativeControllers: true,
            ...config,
        };
        
        // create and configure express
        const expressServer = express();
        
        expressServer.disable('x-powered-by');
        expressServer.set('trust proxy', 1);
        
        expressServer.use(cors());
        expressServer.use(bodyParser.urlencoded({ extended: false }));
        expressServer.use(bodyParser.json());
        
        expressServer.use((request : Request, resp, next) => {
            this.logger.log('Incoming request', colors.brightGreen(request.method), colors.brightCyan(request.path));
            next();
        });
        
        const httpServerOptions = {
            ...(config.httpServerOptions || {})
        };
        const httpServer = http.createServer(httpServerOptions, expressServer);
        
        // playground
        if (config.startGraphQLPlaygroundMiddleware) {
            const expressPlayground = require('graphql-playground-middleware-express').default;
            expressServer.get('/graphql', expressPlayground({ endpoint: '/graphql' }));
        }
        
        if (config.useNativeControllers) {
            this.logger.log('Express - Router binding');
            this.router.bindExpress(expressServer);
        }
        
        if (config.useGraphQL) {
            this.logger.log('Express - GrapQL binding');
            
            const resolvers : any = this.moduleLoader.load<AbstractResolver>([ 'Resolver' ]);
            
            const schema : GraphQLSchema = await buildSchema({
                resolvers: resolvers,
                dateScalarMode: 'isoDate',
                emitSchemaFile: 'etc/schema.gql',
            });
            
            expressServer.post(
                '/graphql',
                graphqlHTTP(<any>((request, response) => ({
                    schema,
                    context: {
                        request,
                        response,
                        entityManager: this.orm.em.fork()
                    } as Context,
                }))),
            );
            
            expressServer.use((
                error : Error,
                req : express.Request,
                res : express.Response,
                next : express.NextFunction
            ) => {
                this.logger.error('Something went wrong', error);
                res.status(400).send(error);
            });
        }
        
        httpServer.listen(config.listenOnPort, () => {
            this.logger.log(`Http server ready on port ${config.listenOnPort}...`);
        });
        
        return expressServer;
    }
    
}
