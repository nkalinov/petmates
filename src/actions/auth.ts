import { Action } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { IResponse } from '../models/interfaces/IResponse';

@Injectable()
export class AuthActions {
    constructor(private storage: Storage,
                private events: Events) {
    }

    static LOGIN = 'AUTH_LOGIN';
    static LOGOUT = 'AUTH_LOGOUT';
    static SIGNUP = 'AUTH_SIGNUP';
    static UPDATE = 'AUTH_UPDATE_USER';

    login(res: IResponse): Action {
        if (res.success) {
            const token = res.data.token,
                user = res.data.profile;

            this.storage.set('id_token', token);
            this.events.publish('user:login', user.region);

            return {
                type: AuthActions.LOGIN,
                payload: {
                    token,
                    user
                }
            };
        }

        this.events.publish('alert:error', res.msg);

        return {
            type: 'ERROR'
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
