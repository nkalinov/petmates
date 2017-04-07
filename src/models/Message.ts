import { User } from './User';

export class Message {
    author: string | User;
    msg: string = '';
    added: Date;
    pic: string;

    picture: string;
    mimetype: string;

    constructor(data?: any) {
        if (data) {
            Object.assign(this, data);

            if (data.added) {
                this.added = new Date(data.added);
            }
        }
    }
}
