import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { AppActions } from '../../app/app.actions';
import { MatesService } from './mates.service';
import { MatesActions } from './mates.actions';
import { SocketActions } from '../../actions/socket.actions';

@Injectable()
export class MatesEffects {
    constructor(private actions$: Actions,
                private matesService: MatesService) {
    }

    @Effect()
    requestDetails$ = this.actions$
        .ofType(MatesActions.DETAILS_REQ)
        .map(toPayload)
        .switchMap(userId =>
            this.matesService.getUserDetails(userId)
                .map(res =>
                    res.success
                        ? MatesActions.getUserDetailsSuccess(res.data)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );

    @Effect()
    search$ = this.actions$
        .ofType(MatesActions.SEARCH)
        .map(toPayload)
        .switchMap(query =>
            this.matesService.search(query)
                .map(res =>
                    res.success
                        ? MatesActions.searchSuccess(res.data)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );

    @Effect()
    add$ = this.actions$
        .ofType(MatesActions.ADD)
        .map(toPayload)
        .switchMap(({ userId, friendId }) =>
            this.matesService.add(friendId)
                .map(res =>
                    res.success
                        ? MatesActions.addSuccess(userId, friendId)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );

    // get new friend's last activity
    @Effect()
    addSuccess$ = this.actions$
        .ofType(
            MatesActions.ADD_SUCCESS,
            MatesActions.SOCKET_ADD_SUCCESS
        )
        .map(toPayload)
        .map(({ userId, friendId }) =>
            SocketActions.emit(
                SocketActions.getLastActivities([friendId])
            )
        );

    @Effect()
    remove$ = this.actions$
        .ofType(MatesActions.REMOVE)
        .map(toPayload)
        .switchMap(({ userId, friendId }) =>
            this.matesService.remove(friendId)
                .map(res =>
                    res.success
                        ? MatesActions.removeSuccess(userId, friendId)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );
}
