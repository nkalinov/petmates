import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { AlertController, Loading, LoadingController, ToastController } from 'ionic-angular';
import { AppActions } from './app.actions';
import { AuthActions } from '../pages/auth/auth.actions';
import { getLoaderMessage, getToastMessage } from '../utils/messages';
import { ApiActions } from '../actions/api.actions';

const showToastActions = [
    AuthActions.FORGOT_REQ_SUCCESS,
    AuthActions.UPDATE_SUCCESS,
    AuthActions.FORGOT_CHANGE_PASSWORD_SUCCESS
];

const showLoaderActions = [
    ApiActions.UPLOAD,

    AuthActions.LOGIN,
    AuthActions.UPDATE,
    AuthActions.FORGOT_REQ,
    AuthActions.FORGOT_VERIFY_TOKEN,
    AuthActions.FORGOT_CHANGE_PASSWORD
];

const hideLoaderActions = [
    AppActions.APP_ERROR,
    ApiActions.UPLOAD_SUCCESS,

    AuthActions.LOGIN_SUCCESS,
    AuthActions.UPDATE_SUCCESS,
    AuthActions.FORGOT_REQ_SUCCESS,
    AuthActions.FORGOT_VERIFY_TOKEN_SUCCESS,
    AuthActions.FORGOT_CHANGE_PASSWORD_SUCCESS
];

@Injectable()
export class AppEffects {
    private loader: Loading;

    constructor(private actions$: Actions,
                private alertCtrl: AlertController,
                private toastCtrl: ToastController,
                private loadingCtrl: LoadingController) {
    }

    @Effect({ dispatch: false })
    err$ = this.actions$
        .ofType(AppActions.APP_ERROR)
        .do(action => {
            this.alertCtrl.create({
                title: 'Error',
                subTitle: action.payload,
                buttons: ['OK']
            }).present();
        });

    @Effect({ dispatch: false })
    showLoader$ = this.actions$
        .ofType(...showLoaderActions)
        .do(action => {
            this.loader = this.loadingCtrl.create({
                content: getLoaderMessage(action)
            });
            this.loader.present();
        });

    @Effect({ dispatch: false })
    hideLoader$ = this.actions$
        .ofType(...hideLoaderActions)
        .do(() => {
            if (this.loader) {
                this.loader.dismissAll();
            }
        });

    @Effect({ dispatch: false })
    toast$ = this.actions$
        .ofType(...showToastActions)
        .do(action => {
            this.toastCtrl.create({
                position: 'bottom',
                duration: 4000,
                message: getToastMessage(action)
            }).present();
        });
}
