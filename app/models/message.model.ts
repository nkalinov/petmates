import {User} from './user.model';

export class Message {
    _id:string;
    from:User;
    to:User;
    msg:string = '';
    added:Date;

    constructor(obj?:any) {
        if(obj) {
            this._id = obj._id || null;
            this.from = obj.from || null;
            this.to = obj.to || null;
            this.msg = obj.msg || '';
            this.added = obj.added ? new Date(obj.added) : null;
        }
    }
}