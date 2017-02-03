import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { AlertController } from 'ionic-angular';
import { AppActions } from './app.actions';

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions,
                private alertCtrl: AlertController) {
    }

    @Effect({ dispatch: false })
    err$ = this.actions$
        .ofType(AppActions.APP_ERROR)
        .map(toPayload)
        .do(payload => {
            this.alertCtrl.create({
                title: 'Error',
                subTitle: payload.msg,
                buttons: ['OK']
            }).present();
        });
}
