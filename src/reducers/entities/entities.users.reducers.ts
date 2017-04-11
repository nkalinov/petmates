import { Action } from '@ngrx/store';
import { AuthActions } from '../../pages/auth/auth.actions';
import { PetsActions } from '../../pages/pets/pets.actions';
import { MatesActions } from '../../pages/mates/mates.actions';
import { STATUS_ACCEPTED, STATUS_PENDING, STATUS_REQUESTED } from '../../models/interfaces/IFriendship';
import { ChatActions } from '../../pages/chat/chat.actions';
const dotProp = require('dot-prop-immutable');
import { merge } from 'lodash';

export default function (state = {}, action: Action) {
    let index;

    switch (action.type) {
        case AuthActions.LOGIN_SUCCESS:
        case AuthActions.UPDATE_SUCCESS:
        case MatesActions.DETAILS_REQ_SUCCESS:
        case MatesActions.SEARCH_SUCCESS:
        case ChatActions.LIST_REQ_SUCCESS:
        case ChatActions.MESSAGES_REQ_SUCCESS:
            if (action.payload.data.entities && action.payload.data.entities.users) {
                return merge(
                    { ...state },
                    action.payload.data.entities.users
                );
            }
            return state;

        case PetsActions.CREATE_SUCCESS:
            return dotProp.set(state, `${action.payload.userId}.pets`, pets => [
                action.payload.pet._id,
                ...pets
            ]);

        case PetsActions.REMOVE_SUCCESS:
            index = state[action.payload.userId].pets.indexOf(action.payload.petId);
            return index > -1
                ? dotProp.delete(state, `${action.payload.userId}.pets.${index}`)
                : state;

        case MatesActions.ADD_SUCCESS:
            index = state[action.payload.userId].mates.findIndex(mate => mate.friend === action.payload.friendId);
            return index > -1
                ? dotProp.set(state, `${action.payload.userId}.mates.${index}.status`, STATUS_ACCEPTED)
                : dotProp.set(state, `${action.payload.userId}.mates`, mates => [
                    {
                        status: STATUS_REQUESTED,
                        friend: action.payload.friendId
                    },
                    ...mates
                ]);

        case MatesActions.SOCKET_ADD_SUCCESS:
            index = state[action.payload.userId].mates.findIndex(mate => mate.friend === action.payload.friendId);
            if (index > -1) {
                return dotProp.set(state, `${action.payload.userId}.mates.${index}.status`, STATUS_ACCEPTED);
            }

            // add profile
            let newState = dotProp.set(state, action.payload.friendId, action.payload.friendProfile);

            // add friendship
            return dotProp.set(newState, `${action.payload.userId}.mates`, mates => [
                {
                    status: STATUS_PENDING,
                    friend: action.payload.friendId
                },
                ...mates
            ]);

        case MatesActions.REMOVE_SUCCESS:
            index = state[action.payload.userId].mates.findIndex(mate => mate.friend === action.payload.friendId);
            return index > -1
                ? dotProp.delete(state, `${action.payload.userId}.mates.${index}`)
                : state;

        default:
            return state;
    }
}
