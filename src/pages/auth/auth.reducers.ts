import { Action } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { User } from '../../models/User';
import { PetsActions } from '../pets/pets.actions';
import { Pet } from '../../models/Pet';

export interface AuthState {
    user?: User;
    token?: string;
    connected?: boolean;
    forgot: {
        tokenValid?: boolean
    };
}

export default function (state: AuthState = { forgot: {} }, action: Action) {
    switch (action.type) {
        case AuthActions.LOGIN_SUCCESS:
            return Object.assign({}, state, {
                user: new User(action.payload.user),
                token: action.payload.token,
                connected: true
            });

        case AuthActions.LOGOUT:
            return Object.assign({}, state, {
                user: null,
                token: null,
                connected: false
            });

        case AuthActions.UPDATE_SUCCESS:
            return Object.assign({}, state, {
                user: action.payload
            });

        case AuthActions.FORGOT_VERIFY_TOKEN_SUCCESS:
            return Object.assign({}, state, {
                forgot: Object.assign({}, state.forgot, {
                    tokenValid: true
                })
            });

        case AuthActions.FORGOT_CHANGE_PASSWORD_SUCCESS:
            return Object.assign({}, state, {
                forgot: Object.assign({}, state.forgot, {
                    tokenValid: false
                })
            });

        case PetsActions.UPDATE_SUCCESS:
            return Object.assign({}, state, {
                user: Object.assign({}, state.user, {
                    pets: [
                        ...state.user.pets.slice(0, action.payload.index),
                        new Pet(action.payload.pet),
                        ...state.user.pets.slice(action.payload.index + 1),
                    ]
                })
            });

        default:
            return state;
    }
}
