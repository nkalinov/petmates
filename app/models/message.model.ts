import {User} from './user.model';

export class Message {
    author:User;
    msg:string = '';
    added:Date;

    constructor(obj?:any) {
        if(obj) {
            this.author = obj.author || null;
            this.msg = obj.msg || '';
            this.added = obj.added ? new Date(<any>obj.added) : null;
        }
    }
}