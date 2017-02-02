import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Events } from 'ionic-angular';
import { AppActions } from './app.actions';

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions,
                private events: Events) {
    }

    @Effect({ dispatch: false })
    err$ = this.actions$
        .ofType(AppActions.APP_ERROR)
        .map(toPayload)
        .do(payload => {
            this.events.publish('alert:error', payload.msg);
        });
}
