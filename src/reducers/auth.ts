import { Action } from '@ngrx/store';
import { AuthActions } from '../actions/auth';
import { User } from '../models/User';
import { Pet } from '../models/Pet';

export function authReducer(state = {}, action: Action) {
    switch (action.type) {

        case AuthActions.LOGIN:
            const user = new User(action.payload.user);
            // user.password = '';
            user.pets = user.pets.map(pet => new Pet(pet));
            user.mates.forEach(mate => {
                mate.friend = new User(mate.friend);
            });

            return Object.assign({}, state, {
                user,
                token: action.payload.token
            });

        default:
            return state;
    }
}
