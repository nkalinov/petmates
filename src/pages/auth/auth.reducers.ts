import { Action } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { User } from '../../models/User';
import { Pet } from '../../models/Pet';

export function authReducer(state = {}, action: Action) {
    switch (action.type) {

        case AuthActions.LOGIN_SUCCESS:
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

        case AuthActions.LOGOUT:
            return Object.assign({}, state, {
                user: null,
                token: null
            });

        default:
            return state;
    }
}
