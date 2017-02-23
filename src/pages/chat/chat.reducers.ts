import { ChatActions } from './chat.actions';
import { Action } from '@ngrx/store';
import { Conversation } from '../../models/Conversation';

export default {
    list: chatListReducer
};

export function chatListReducer(state = [], action: Action) {
    switch (action.type) {

        case ChatActions.LIST_REQ_SUCCESS:
            return action.payload.map(conversation => new Conversation(conversation));

        default:
            return state;
    }
}
