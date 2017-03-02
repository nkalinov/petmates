import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { AppActions } from '../../app/app.actions';
import { ChatActions } from './chat.actions';
import { ChatService } from '../../providers/chat.service';
import { IResponse } from '../../models/interfaces/IResponse';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ChatEffects {
    constructor(private actions$: Actions,
                private chatService: ChatService) {
    }

    @Effect()
    listReq$ = this.actions$
        .ofType(ChatActions.LIST_REQ)
        .switchMap(() =>
            this.chatService.getList()
                .map((res: IResponse) =>
                    res.success
                        ? ChatActions.requestListSuccess(res.data)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );
}
