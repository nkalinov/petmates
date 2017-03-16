import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { AppActions } from '../../app/app.actions';
import { MatesService } from './mates.service';
import { MatesActions } from './mates.actions';

@Injectable()
export class MatesEffects {
    constructor(private actions$: Actions,
                private matesService: MatesService) {
    }

    // @Effect({ dispatch: false })
    // connect$ = this.actions$
    //     .ofType(SocketActions.CONNECT_SUCCESS)
    //     .map(toPayload)
    //     .do(socket => {
    //         this.matesService.registerSocketEvents(socket);
    //     });

    @Effect()
    requestDetails$ = this.actions$
        .ofType(MatesActions.DETAILS_REQ)
        .map(toPayload)
        .switchMap(userId =>
            // todo new User(res.data, this.user.location.coordinates);
            this.matesService.getUserDetails(userId)
                .map(res =>
                    res.success
                        ? MatesActions.getUserDetailsSuccess(res.data)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
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
