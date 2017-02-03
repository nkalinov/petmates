import { Action } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { User } from '../../models/User';

export function authReducer(state = {}, action: Action) {
    switch (action.type) {

        case AuthActions.LOGIN_SUCCESS:
            return Object.assign({}, state, {
                user: new User(action.payload.user),
                token: action.payload.token
            });

        case AuthActions.LOGOUT:
            return Object.assign({}, state, {
                user: null,
                token: null
            });

        case AuthActions.UPDATE_SUCCESS:
            return Object.assign({}, state, {
                user: action.payload
            });

        default:
            return state;
    }
}
