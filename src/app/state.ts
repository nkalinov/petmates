import { User } from '../models/User';

export interface AppState {
    auth: {
        user: User,
        token: string
    };
}
