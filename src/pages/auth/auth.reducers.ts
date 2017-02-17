import { Action } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { User } from '../../models/User';

export interface AuthState {
    user?: User;
    token?: string;
    connected?: boolean;
    forgot: {
        tokenValid?: boolean
    };
}

export function authReducer(state: AuthState = {
    forgot: {}
}, action: Action) {
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

        default:
            return state;
    }
}
