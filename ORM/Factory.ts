import { Configuration } from 'intiv/utils/Configuration';
import { Inject, ReleaseSymbol } from 'intiv/utils/ObjectManager';
import { MikroORM, Options } from '@mikro-orm/core';


export default class OrmFactory
{

    @Inject()
    protected configuration : Configuration;

    public async create() : Promise<MikroORM>
    {
        const config = this.configuration.get<Options>('services.orm');
        const orm = await MikroORM.init(config);

        const migrator = orm.getMigrator();
        const migrations = await migrator.getPendingMigrations();
        if (migrations && migrations.length > 0) {
            console.warn(`There are pending migrations! (${migrations.length})`);
        }

        // assign release procedure
        orm[ReleaseSymbol] = async () => {
            return await orm.close();
        }

        return orm;
    }

}
