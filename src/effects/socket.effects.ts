import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { AuthActions } from '../pages/auth/auth.actions';
import { SocketActions } from '../actions/socket.actions';
import { SocketService } from '../providers/socket.service';
import { ChatService } from '../providers/chat.service';
import { MatesService } from '../providers/mates.service';
import { WalkService } from '../providers/walk.service';

@Injectable()
export class SocketEffects {
    constructor(private actions$: Actions,
                private socketActions: SocketActions,
                private socketService: SocketService,
                private chatService: ChatService,
                private matesService: MatesService,
                private walkService: WalkService) {
    }

    @Effect()
    login$ = this.actions$
        .ofType(AuthActions.LOGIN_SUCCESS)
        .map(toPayload)
        .switchMap(({ token, user }) =>
                this.socketService.connect(user.region, token)
                    .map(socket => {
                        // todo for each service, create [service].effects and attach listeners on SOCKET_CONNECTED ?
                        this.chatService.registerSocketEvents(socket);
                        this.matesService.registerSocketEvents(socket);
                        this.walkService.registerSocketEvents(socket);
                        return this.socketActions.connected(socket);
                    })
            // todo catch?
        );

    @Effect()
    logout$ = this.actions$
        .ofType(AuthActions.LOGOUT)
        .map(() => {
            this.socketService.disconnect();
            return this.socketActions.disconnected();
        });
}
