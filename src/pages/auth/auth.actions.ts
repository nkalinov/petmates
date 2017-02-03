import { Action } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { User } from '../../models/User';

@Injectable()
export class AuthActions {
    static LOGIN = 'AUTH_LOGIN';
    static LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
    static REFRESH = 'AUTH_REFRESH';
    static LOGOUT = 'AUTH_LOGOUT';
    static DELETE_PROFILE = 'AUTH_DELETE_PROFILE';
    static SIGNUP = 'AUTH_SIGNUP';
    static UPDATE = 'AUTH_UPDATE_USER';
    static UPDATE_SUCCESS = 'AUTH_UPDATE_USER_SUCCESS';

    login(email, password): Action {
        return {
            type: AuthActions.LOGIN,
            payload: {
                email,
                password
            }
        };
    }

    loginSuccess(token, user): Action {
        return {
            type: AuthActions.LOGIN_SUCCESS,
            payload: {
                token,
                user
            }
        };
    }

    refresh(): Action {
        return {
            type: AuthActions.REFRESH
        };
    }

    logout(): Action {
        return {
            type: AuthActions.LOGOUT
        };
    }

    deleteProfile(): Action {
        return {
            type: AuthActions.DELETE_PROFILE
        };
    }

    signup(payload: User): Action {
        return {
            type: AuthActions.SIGNUP,
            payload
        };
    }

    update(payload: User): Action {
        return {
            type: AuthActions.UPDATE,
            payload
        };
    }

    updateSuccess(payload: User): Action {
        return {
            type: AuthActions.UPDATE_SUCCESS,
            payload
        };
    }
}
