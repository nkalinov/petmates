import { Action } from '@ngrx/store';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthActions {
    static LOGIN = 'AUTH_LOGIN';
    static LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
    static REFRESH = 'AUTH_REFRESH';
    static LOGOUT = 'AUTH_LOGOUT';

    static SIGNUP = 'AUTH_SIGNUP';
    static UPDATE = 'AUTH_UPDATE_USER';

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

    signup(data: any): Action {
        return {
            type: AuthActions.SIGNUP,
            payload: data
        };
    }

    update(data: any): Action {
        return {
            type: AuthActions.UPDATE,
            payload: data
        };
    }
}
