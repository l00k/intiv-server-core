import { Initializable, Initialize } from 'intiv/utils/Initializable';


@Initialize()
export default class ActionResult
    extends Initializable<ActionResult>
{
    
    public code : number = 200;
    
    public payload : any = null;
    
}
