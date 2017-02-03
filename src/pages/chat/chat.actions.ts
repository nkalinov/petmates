import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class ChatActions {
    static LIST_REQ = 'CHAT_LIST_REQ';
    static LIST_REQ_SUCCESS = 'CHAT_LIST_REQ_SUCCESS';

    requestList(): Action {
        return {
            type: ChatActions.LIST_REQ
        };
    }

    requestListSuccess(payload): Action {
        return {
            type: ChatActions.LIST_REQ_SUCCESS,
            payload
        };
    }
}
