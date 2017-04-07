import { ChatActions } from './chat.actions';
import { Action } from '@ngrx/store';
import { Conversation } from '../../models/Conversation';
const dotProp = require('dot-prop-immutable');

export default function chatListReducer(state = [], action: Action) {
    switch (action.type) {
        case ChatActions.LIST_REQ_SUCCESS:
            return action.payload.data.result.map(conversation => new Conversation(conversation));

        case ChatActions.MESSAGES_REQ_SUCCESS:
            let index = state.findIndex(chat => chat._id === action.payload.chatId);
            if (index > -1) {
                return [
                    ...state.slice(0, index),
                    dotProp.set(state[index], 'messages', action.payload.messages),
                    ...state.slice(index + 1)
                ]
            }
            return state;

        default:
            return state;
    }
}
