import { Configuration } from 'intiv/utils/Configuration';
import { EventBus } from 'intiv/utils/EventBus';
import { Inject } from 'intiv/utils/ObjectManager';
import { MikroORM } from '@mikro-orm/core';
import bodyParser from 'body-parser';
import { Context } from 'intiv/core/GraphQL';
import ModuleLoader from 'intiv/core/Loader/ModuleLoader';
import AbstractResolver from 'intiv/core/Module/AbstractResolver';
import cors from 'cors';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import http from 'http';
import https, { ServerOptions } from 'https';
import { buildSchema } from 'type-graphql';
import { Logger } from 'intiv/utils/Utility';


const env = process.env.NODE_ENV || 'production';
const isDev = env !== 'production';


export type ExpressConfig = {
    listenOnPort: number,
    httpServerOptions?: ServerOptions,
    useGraphQL? : boolean,
    startGraphQLPlaygroundMiddleware?: boolean,
}


export default class ExpressFactory
{

    @Inject({ ctorArgs: [ ExpressFactory.name ] })
    protected logger : Logger;

    @Inject()
    protected configuration : Configuration;

    @Inject()
    public moduleLoader : ModuleLoader;

    @Inject()
    public eventBus : EventBus;

    @Inject({ name: 'orm' })
    protected orm : MikroORM;


    public async create(config : ExpressConfig) : Promise<express.Application>
    {
        // create and configure express
        const expressServer = express();

        expressServer.disable('x-powered-by');
        expressServer.set('trust proxy', 1);
        expressServer.use(cors());

        const httpServerOptions = {
            ...(config.httpServerOptions || {})
        };
        const httpServer = http.createServer(httpServerOptions, expressServer);
        
        // playground
        if (isDev) {
            const expressPlayground = require('graphql-playground-middleware-express').default;
            expressServer.get('/graphql', expressPlayground({ endpoint: '/graphql' }));
        }

        const promises = [];
        
        if (config.useGraphQL) {
            const promise = new Promise(async(resolve, reject) => {
                try {
                    const resolvers : any = this.moduleLoader.load<AbstractResolver>([ 'Resolver' ]);
    
                    const schema : GraphQLSchema = await buildSchema({
                        resolvers: resolvers,
                        dateScalarMode: 'isoDate',
                        // emitSchemaFile: 'etc/schema.gql',
                    });
    
                    expressServer.post(
                        '/graphql',
                        bodyParser.json(),
                        graphqlHTTP(<any> ((request, response) => ({
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
                catch (error) {
                    this.logger.error('Could not start server', error);
                    reject();
                }
            });
            promises.push(promise);
        }
        
        await Promise.all(promises);
        
        httpServer.listen(config.listenOnPort, () => {
            this.logger.log(`Http server ready on port ${config.listenOnPort}...`);
        });
        
        return expressServer;
    }

}
