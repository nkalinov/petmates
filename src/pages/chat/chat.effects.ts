import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { AppActions } from '../../app/app.actions';
import { ChatActions } from './chat.actions';
import { ChatService } from '../../providers/chat.service';
import { IResponse } from '../../models/interfaces/IResponse';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ChatEffects {
    constructor(private actions$: Actions,
                private chatService: ChatService,
                private chatActions: ChatActions,
                private appActions: AppActions) {
    }

    @Effect()
    listReq$ = this.actions$
        .ofType(ChatActions.LIST_REQ)
        .switchMap(() =>
            this.chatService.getList()
                .map((res: IResponse) =>
                    res.success
                        ? this.chatActions.requestListSuccess(res.data)
                        : this.appActions.error(res.msg)
                )
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        );
}
