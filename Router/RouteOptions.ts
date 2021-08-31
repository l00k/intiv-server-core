import { Initializable, Initialize } from 'intiv/utils/Initializable';


type Arguments = {
    [index : string] : any
};


@Initialize()
export default class RouteOptions
    extends Initializable<RouteOptions>
{

    public method : string = 'GET';

    public arguments : Arguments = {};

}
