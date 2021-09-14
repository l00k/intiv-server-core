import AbstractApp from 'intiv/core/Module/AbstractApp';
import * as cli from 'classy-commander';


export default abstract class AbstractCliApp
    extends AbstractApp
{
    
    protected async main ()
    {
        this.moduleLoader.load(['Command']);
        
        await cli.execute();
    }
    
}
