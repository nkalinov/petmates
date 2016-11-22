import { User } from './user.model';

export class Message {
    author: User;
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
