import { Initializable, Initialize } from 'intiv/utils/Initializable';
import RouteOptions from './RouteOptions';


@Initialize()
export default class Route
    extends Initializable<Route>
{

    public path : string = null;

    public action : string = null;

    public options : RouteOptions = new RouteOptions();

}
