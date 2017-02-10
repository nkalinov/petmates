import { Conversation } from '../models/Conversation';
import { AuthState } from '../pages/auth/auth.reducers';

export interface AppState {
    auth: AuthState;
    chat: {
        list: Conversation[]
    };
}
