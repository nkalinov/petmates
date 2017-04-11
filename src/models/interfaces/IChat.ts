import { Message } from '../Message';
import { User } from '../User';

export interface IChat {
    _id: string;
    name: string;
    members: (string | User)[];
    messages: Message[];
    lastMessage: Message;
    newMessages: number;
    fromSocket: boolean;
}
