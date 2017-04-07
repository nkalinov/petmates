import { Message } from './Message';
import { User } from './User';

export class Conversation {
    _id: string;
    name: string;
    members: (string | User)[];
    messages: Message[] = [];
    lastMessage: Message;

    newMessages: number = 0;

    constructor(data?) {
        Object.assign(this, data);

        // if (this.lastMessage) {
        //     let findAuthor = this.members.find(m => m._id === this.lastMessage.author);
        //     if (findAuthor) {
        //         this.lastMessage.author = findAuthor;
        //     }
        //     this.lastMessage.added = new Date(<any>this.lastMessage.added);
        // }
    }
}
