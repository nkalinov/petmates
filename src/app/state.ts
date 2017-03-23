import { Conversation } from '../models/Conversation';
import { AuthState } from '../pages/auth/auth.reducers';
import { User } from '../models/User';
import { Pet } from '../models/Pet';

export interface AppState {
    auth: AuthState;
    chat: {
        list: Conversation[]
    };
    entities: {
        users: { [key: string]: User },
        pets: { [key: string]: Pet },
        coordinates: { [key: string]: L.LatLngTuple }
    };
    lastActivities: { [key: string]: number };
    matesSearchResults: string[];
}
