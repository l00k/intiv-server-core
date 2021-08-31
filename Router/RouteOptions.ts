import { Initializable } from 'intiv/utils/Initializable';


type Arguments = {
    [index : string] : any
};


class RouteOptions
{

    public method : string = 'GET';

    public arguments : Arguments = {};

}

export default class extends Initializable(RouteOptions) {};
