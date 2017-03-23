import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { AuthActions } from '../pages/auth/auth.actions';
import { SocketActions } from '../actions/socket.actions';
import { SocketService } from '../providers/socket.service';
import { Observable } from 'rxjs';

@Injectable()
export class SocketEffects {
    constructor(private actions$: Actions,
                private socketService: SocketService) {
    }

    @Effect()
    login$ = this.actions$
        .ofType(AuthActions.LOGIN_SUCCESS)
        .map(toPayload)
        .switchMap(({ token, user }) =>
            this.socketService.connect(user.region, token)
                .mergeMap(socket => Observable.of(
                    SocketActions.connectSuccess(socket),
                    SocketActions.emit(
                        SocketActions.getLastActivities((user.mates || []).map(m => m.friend._id))
                    )
                ))
                .catch(err => Observable.of(SocketActions.connectError(err)))
        );

    // @Effect()
    // connect$ = this.actions$
    //     .ofType(SocketActions.CONNECT_SUCCESS)
    //     .map(() => {
    //         return SocketActions.getLastActive();
    //     });

    @Effect()
    disconnect$ = this.actions$
        .ofType(AuthActions.LOGOUT)
        .map(() => {
            this.socketService.disconnect();
            return SocketActions.disconnect();
        });

    @Effect({ dispatch: false })
    emit$ = this.actions$
        .ofType(SocketActions.EMIT)
        .map(toPayload)
        .do(action => {
            this.socketService.emit(action);
        });
}
