import { Action } from '@ngrx/store';
import { IChat } from '../../models/interfaces/IChat';
import { normalize } from 'normalizr';
import { chatObject, messageObject } from '../../app/schemas';
import { Message } from '../../models/Message';

export class ChatActions {
    static LIST_REQ = 'CHAT_LIST_REQ';

    static requestList(): Action {
        return {
            type: ChatActions.LIST_REQ
        };
    }

    static LIST_REQ_SUCCESS = 'CHAT_LIST_REQ_SUCCESS';

    static requestListSuccess(data: IChat[]): Action {
        return {
            type: ChatActions.LIST_REQ_SUCCESS,
            payload: {
                data: normalize(data, [chatObject])
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
                data: normalize(messages, [messageObject])
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
    static SOCKET_SEND_MSG_REQ_SUCCESS = 'SOCKET_CHAT_SEND_MSG_REQ_SUCCESS';

    static sendMessageSuccess(msg: Message, chatId: string): Action {
        return {
            type: ChatActions.SEND_MSG_REQ_SUCCESS,
            payload: {
                msg,
                chatId
            }
        };
    }
    static READ_MSG = 'CHAT_MSG_READ';

    static readMessages(chatId: string): Action {
        return {
            type: ChatActions.READ_MSG,
            payload: {
                chatId
            }
        };
    }
}
