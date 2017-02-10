import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { AlertController, Loading, LoadingController, ToastController } from 'ionic-angular';
import { AppActions } from './app.actions';
import { AuthActions } from '../pages/auth/auth.actions';
import { getLoaderMessage, getToastMessage } from '../utils/messages';
import { ApiActions } from '../actions/api.actions';

@Injectable()
export class AppEffects {
    private loader: Loading;

    constructor(private actions$: Actions,
                private alertCtrl: AlertController,
                private toastCtrl: ToastController,
                loadingCtrl: LoadingController) {
        this.loader = loadingCtrl.create();
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
        .ofType(
            AuthActions.LOGIN,
            AuthActions.UPDATE,
            ApiActions.UPLOAD
        )
        .do(action => {
            this.loader.setContent(getLoaderMessage(action));
            this.loader.present();
        });

    @Effect({ dispatch: false })
    hideLoader$ = this.actions$
        .ofType(
            AppActions.APP_ERROR,
            AuthActions.LOGIN_SUCCESS,
            AuthActions.UPDATE_SUCCESS,
            ApiActions.UPLOAD_SUCCESS
        )
        .do(() => {
            this.loader.dismissAll();
        });

    @Effect({ dispatch: false })
    toast$ = this.actions$
        .ofType(
            AuthActions.FORGOT_REQ_SUCCESS,
            AuthActions.UPDATE_SUCCESS
        )
        .do(action => {
            this.toastCtrl.create({
                position: 'bottom',
                duration: 4000,
                message: getToastMessage(action)
            }).present();
        });
}
