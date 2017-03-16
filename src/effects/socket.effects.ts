import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { AuthActions } from '../pages/auth/auth.actions';
import { SocketActions } from '../actions/socket.actions';
import { SocketService } from '../providers/socket.service';
import { Action, Store } from '@ngrx/store';
import { AppState } from '../app/state';

@Injectable()
export class SocketEffects {
    constructor(private actions$: Actions,
                private socketService: SocketService,
                private store: Store<AppState>) {
    }

    @Effect()
    login$ = this.actions$
        .ofType(AuthActions.LOGIN_SUCCESS)
        .map(toPayload)
        .switchMap(({ token, region }) =>
            this.socketService.connect(region, token)
                .map(socket => SocketActions.connectSuccess(socket))
                .catch(err => SocketActions.connectError(err))
        );

    @Effect()
    disconnect$ = this.actions$
        .ofType(AuthActions.LOGOUT)
        .map(() => {
            this.socketService.disconnect();
            return SocketActions.disconnect();
        });

    @Effect({ dispatch: false })
    connect$ = this.actions$
        .ofType(SocketActions.CONNECT_SUCCESS)
        .map(toPayload)
        .do(socket => {
            socket.on('action', (action: Action) => {
                this.store.dispatch(action);
            });
        });

    @Effect({ dispatch: false })
    emit$ = this.actions$
        .ofType(SocketActions.EMIT)
        .map(toPayload)
        .do(action => {
            this.socketService.emit(action);
        });
}
