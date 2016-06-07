import {Message} from './message.model';

export class Conversation {
    _id:string;
    name:string;
    members:Array<any> = [];
    messages:Array<any> = [];
    lastMessage:Message;

    newMessages:number = 0;

    constructor(data?) {
        if (data) {
            Object.assign(this, data);

            if (this.lastMessage) {
                let findAuthor = this.members.find((m) => m._id === this.lastMessage.author);
                if (findAuthor) {
                    this.lastMessage.author = findAuthor;
                }
                this.lastMessage.added = new Date(<any>this.lastMessage.added);
            }
        }
    }
}