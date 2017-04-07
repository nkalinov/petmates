import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { AppActions } from '../../app/app.actions';
import { ChatActions } from './chat.actions';
import { ChatService } from '../../providers/chat.service';
import { Observable } from 'rxjs/Observable';
import { SocketActions } from '../../actions/socket.actions';

@Injectable()
export class ChatEffects {
    constructor(private actions$: Actions,
                private chatService: ChatService) {
    }

    @Effect()
    list$ = this.actions$
        .ofType(ChatActions.LIST_REQ)
        .switchMap(() =>
            this.chatService.getList()
                .map(res =>
                    res.success
                        ? ChatActions.requestListSuccess(res.data)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );

    @Effect()
    messages$ = this.actions$
        .ofType(ChatActions.MESSAGES_REQ)
        .map(toPayload)
        .switchMap(({ chatId }) =>
            this.chatService.getMessages(chatId)
                .map(res =>
                    res.success
                        ? ChatActions.requestMessagesSuccess(chatId, res.data)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );

    @Effect()
    send$ = this.actions$
        .ofType(ChatActions.SEND_MSG_REQ)
        .map(toPayload)
        .switchMap(({ msg, chatId }) =>
            this.chatService.send(msg, chatId)
                .mergeMap(res => res.success
                    ? Observable.of(
                        ChatActions.sendMessageSuccess(msg, chatId),
                        SocketActions.emit(ChatActions.sendMessageSuccess(msg, chatId))
                    )
                    : Observable.of(AppActions.error(res.msg))
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );
}
