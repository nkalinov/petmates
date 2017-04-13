import { ChatActions } from './chat.actions';
import { Action } from '@ngrx/store';
import { IChat } from '../../models/interfaces/IChat';
import { Message } from '../../models/Message';
import { setInArrayById } from '../../utils/helpers';

export default function chatListReducer(state = [], action: Action) {
    switch (action.type) {
        case ChatActions.LIST_REQ_SUCCESS:
            return action.payload.data.result.map(conversation =>
                ({
                    ...state.find(c => c._id === conversation._id),
                    ...conversation
                })
            );

        case ChatActions.MESSAGES_REQ_SUCCESS:
            return setInArrayById(state, action.payload.chatId, 'messages', action.payload.data.result);

        case ChatActions.SEND_MSG_REQ: // add immediately
            return addMessage(state, action.payload.msg, action.payload.chatId);

        case ChatActions.SOCKET_SEND_MSG_REQ_SUCCESS: // msg received
            return addMessage(state, action.payload.msg, action.payload.chatId, true);

        case ChatActions.READ_MSG:
            return setInArrayById(state, action.payload.chatId, 'newMessages', 0);

        default:
            return state;
    }
}

function addMessage(state = [], data: Message, chatId: string, fromSocket?: boolean) {
    let index = state.findIndex(chat => chat._id === chatId),
        message = new Message(data, fromSocket);

    if (index > -1) {
        return [
            ...state.slice(0, index),
            {
                ...state[index],
                messages: (state[index].messages || []).concat(message),
                lastMessage: message,
                newMessages: fromSocket
                    ? !isNaN(+state[index].newMessages) && state[index].newMessages + 1 || 1
                    : state[index].newMessages || 0
            },
            ...state.slice(index + 1)
        ]
    } else {
        // user haven't requested chat list yet
        return <IChat[]>[
            {
                _id: chatId,
                messages: [message],
                lastMessage: message,
                newMessages: 1
            },
            ...state
        ];
    }
}
