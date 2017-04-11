import { Action } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { SocketActions } from '../../actions/socket.actions';
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
            return {
                ...state,
                user: action.payload.user._id,
                token: action.payload.token
            };

        case SocketActions.CONNECT_SUCCESS:
            return {
                ...state,
                // user is considered connected only after the socket is
                // that's because we need to have him added in the sockets Map before to be able to join rooms
                connected: true
            };

        case AuthActions.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                connected: false
            };

        case AuthActions.FORGOT_VERIFY_TOKEN_SUCCESS:
        case AuthActions.FORGOT_CHANGE_PASSWORD_SUCCESS:
            return dotProp.toggle(state, 'forgot.tokenValid');

        default:
            return state;
    }
}
