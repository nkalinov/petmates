import { User } from '../models/User';
import { Conversation } from '../models/Conversation';

export interface AppState {
    auth: {
        user: User,
        token: string
    };
    chat: {
        list: Conversation[]
    };
}
