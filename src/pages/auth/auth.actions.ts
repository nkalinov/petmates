import { Action } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { User } from '../../models/User';

@Injectable()
export class AuthActions {
    static LOGIN = 'AUTH_LOGIN';

    login(email, password): Action {
        return {
            type: AuthActions.LOGIN,
            payload: {
                email,
                password
            }
        };
    }

    static LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';

    loginSuccess(token, user): Action {
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

    static DELETE_PROFILE = 'AUTH_DELETE_PROFILE';

    deleteProfile(): Action {
        return {
            type: AuthActions.DELETE_PROFILE
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

    forgotRequest(email: string): Action {
        return {
            type: AuthActions.FORGOT_REQ,
            payload: email
        };
    }

    static FORGOT_REQ_SUCCESS = 'AUTH_FORGOT_REQ_SUCCESS';

    submitForgotRequestSuccess(msg: string): Action {
        return {
            type: AuthActions.FORGOT_REQ_SUCCESS,
            payload: msg
        };
    }
}
