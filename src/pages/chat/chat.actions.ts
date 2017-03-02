import { Action } from '@ngrx/store';

export class ChatActions {
    static LIST_REQ = 'CHAT_LIST_REQ';
    static LIST_REQ_SUCCESS = 'CHAT_LIST_REQ_SUCCESS';

    static requestList(): Action {
        return {
            type: ChatActions.LIST_REQ
        };
    }

    static requestListSuccess(payload): Action {
        return {
            type: ChatActions.LIST_REQ_SUCCESS,
            payload
        };
    }
}
