import { Action } from '@ngrx/store';
import { Conversation } from '../../models/Conversation';
import { normalize } from 'normalizr';
import { chatEntity } from '../../app/schemas';
import { Message } from '../../models/Message';

export class ChatActions {
    static LIST_REQ = 'CHAT_LIST_REQ';

    static requestList(): Action {
        return {
            type: ChatActions.LIST_REQ
        };
    }

    static LIST_REQ_SUCCESS = 'CHAT_LIST_REQ_SUCCESS';

    static requestListSuccess(data: Conversation[]): Action {
        return {
            type: ChatActions.LIST_REQ_SUCCESS,
            payload: {
                data: normalize(data, [chatEntity])
            }
        };
    }

    static MESSAGES_REQ = 'CHAT_MESSAGES_REQ';

    static requestMessages(chatId: string): Action {
        return {
            type: ChatActions.MESSAGES_REQ,
            payload: {
                chatId
            }
        };
    }

    static MESSAGES_REQ_SUCCESS = 'CHAT_MESSAGES_REQ_SUCCESS';

    static requestMessagesSuccess(chatId: string, messages: Message[]): Action {
        return {
            type: ChatActions.MESSAGES_REQ_SUCCESS,
            payload: {
                chatId,
                messages
            }
        };
    }

    static SEND_MSG_REQ = 'CHAT_SEND_MSG_REQ';

    static sendMessage(msg: Message, chatId: string): Action {
        return {
            type: ChatActions.SEND_MSG_REQ,
            payload: {
                msg,
                chatId
            }
        };
    }

    static SEND_MSG_REQ_SUCCESS = 'CHAT_SEND_MSG_REQ_SUCCESS';

    static sendMessageSuccess(msg: Message, chatId: string): Action {
        return {
            type: ChatActions.SEND_MSG_REQ_SUCCESS,
            payload: {
                msg,
                chatId
            }
        };
    }
}
