import AbstractApp from 'intiv/core/Module/AbstractApp';
import * as CLI from 'classy-commander';


export default abstract class AbstractCliApp
    extends AbstractApp
{
    
    protected async main ()
    {
        this.moduleLoader.load(['Command']);
        await CLI.execute();
    }
    
}
