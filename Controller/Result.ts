import { Initializable, RecursivePartial, Initialize } from 'intiv/utils/Initializable';


@Initialize()
export default class Result
    extends Initializable<Result>
{

    private _code : number = 200;

    private _payload : any = null;


    get code() : number
    {
        return this._code;
    }

    set code(value : number)
    {
        this._code = value;
    }

    get payload() : any
    {
        return this._payload;
    }

    set payload(value : any)
    {
        this._payload = value;
    }

}
