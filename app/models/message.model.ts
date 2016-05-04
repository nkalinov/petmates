import {User} from './user.model';
import {Utils} from '../services/utils';

export class Message {
    _id:string;
    from:User;
    to:User;
    msg:string;
    createDate:Date;

    constructor(obj:any) {
        // this._id = obj._id || Utils.randomId();
        this._id = obj._id;
        this.from = obj.from || null;
        this.to = obj.to || null;
        this.msg = obj.msg || null;
        this.createDate = new Date();
    }
}