import { Action } from '@ngrx/store';
import { AuthActions } from './auth.actions';
const dotProp = require('dot-prop-immutable');

export interface AuthState {
    user?: string;
    token?: string;
    connected?: boolean;
    forgot: {
        tokenValid?: boolean
    };
}

const defaultState = {
    forgot: {}
};

export default function (state: AuthState = defaultState, action: Action) {
    switch (action.type) {
        case AuthActions.LOGIN_SUCCESS:
            return Object.assign({}, state, {
                user: action.payload.userId,
                token: action.payload.token,
                connected: true
            });

        case AuthActions.LOGOUT:
            return Object.assign({}, state, {
                user: null,
                token: null,
                connected: false
            });

        case AuthActions.FORGOT_VERIFY_TOKEN_SUCCESS:
        case AuthActions.FORGOT_CHANGE_PASSWORD_SUCCESS:
            return dotProp.toggle(state, 'forgot.tokenValid');

        default:
            return state;
    }
}
