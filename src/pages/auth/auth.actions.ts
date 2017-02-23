import { Action } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { User } from '../../models/User';

@Injectable()
export class AuthActions {
    static LOGIN = 'AUTH_LOGIN';

    login(email: string, password: string): Action {
        return {
            type: AuthActions.LOGIN,
            payload: {
                email,
                password
            }
        };
    }

    static LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';

    loginSuccess(token: string, user: User): Action {
        return {
            type: AuthActions.LOGIN_SUCCESS,
            payload: {
                token,
                user
            }
        };
    }

    static REFRESH = 'AUTH_REFRESH';

    refresh(): Action {
        return {
            type: AuthActions.REFRESH
        };
    }

    static LOGOUT = 'AUTH_LOGOUT';

    logout(): Action {
        return {
            type: AuthActions.LOGOUT
        };
    }

    static REMOVE = 'AUTH_DELETE_PROFILE';

    remove(): Action {
        return {
            type: AuthActions.REMOVE
        };
    }

    static SIGNUP = 'AUTH_SIGNUP';

    signup(payload: User): Action {
        return {
            type: AuthActions.SIGNUP,
            payload
        };
    }

    static UPDATE = 'AUTH_UPDATE_USER';

    update(payload: User): Action {
        return {
            type: AuthActions.UPDATE,
            payload
        };
    }

    static UPDATE_SUCCESS = 'AUTH_UPDATE_USER_SUCCESS';

    updateSuccess(payload: User): Action {
        return {
            type: AuthActions.UPDATE_SUCCESS,
            payload
        };
    }

    static FORGOT_REQ = 'AUTH_FORGOT_REQ';

    requestForgotToken(email: string): Action {
        return {
            type: AuthActions.FORGOT_REQ,
            payload: email
        };
    }

    static FORGOT_REQ_SUCCESS = 'AUTH_FORGOT_REQ_SUCCESS';

    requestForgotTokenSuccess(msg: string): Action {
        return {
            type: AuthActions.FORGOT_REQ_SUCCESS,
            payload: msg
        };
    }

    static FORGOT_VERIFY_TOKEN = 'AUTH_FORGOT_VERIFY_TOKEN';

    verifyToken(token: string): Action {
        return {
            type: AuthActions.FORGOT_VERIFY_TOKEN,
            payload: token
        };
    }

    static FORGOT_VERIFY_TOKEN_SUCCESS = 'AUTH_FORGOT_VERIFY_TOKEN_SUCCESS';

    verifyTokenSuccess(): Action {
        return {
            type: AuthActions.FORGOT_VERIFY_TOKEN_SUCCESS
        };
    }

    static FORGOT_CHANGE_PASSWORD = 'AUTH_FORGOT_CHANGE_PASSWORD';

    changePassword(token: string, password: string): Action {
        return {
            type: AuthActions.FORGOT_CHANGE_PASSWORD,
            payload: {
                token,
                password
            }
        };
    }

    static FORGOT_CHANGE_PASSWORD_SUCCESS = 'AUTH_FORGOT_CHANGE_PASSWORD_SUCCESS';

    changePasswordSuccess(email?: string, password?: string): Action {
        return {
            type: AuthActions.FORGOT_CHANGE_PASSWORD_SUCCESS,
            payload: {
                email,
                password
            }
        };
    }
}
