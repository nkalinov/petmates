import { User } from './User';

export class Message {
    author: string | User;
    msg: string = '';
    added: Date;
    pic: string;
    picture: string;
    mimetype: string;
    fromSocket: boolean;

    constructor(data?: any, fromSocket: boolean = false) {
        if (data) {
            Object.assign(this, data);

            if (data.added) {
                this.added = new Date(data.added);
            }

            this.fromSocket = fromSocket;
        }
    }
}
