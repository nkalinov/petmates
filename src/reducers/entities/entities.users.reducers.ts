import { Action } from '@ngrx/store';
import { AuthActions } from '../../pages/auth/auth.actions';
import { PetsActions } from '../../pages/pets/pets.actions';
import { MatesActions } from '../../pages/mates/mates.actions';
const dotProp = require('dot-prop-immutable');

export default function (state = {}, action: Action) {
    let index;

    switch (action.type) {
        case AuthActions.LOGIN_SUCCESS:
        case AuthActions.UPDATE_SUCCESS:
        case MatesActions.DETAILS_REQ_SUCCESS:
            // todo assign only if different to not re-emit every relevant observable
            return Object.assign({}, state, action.payload.data.entities.users);

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

        case MatesActions.REMOVE_SUCCESS:
            index = state[action.payload.userId].mates.findIndex(mate => mate._id === action.payload.mateId);
            return index > -1
                ? dotProp.delete(state, `${action.payload.userId}.mates.${index}`)
                : state;

        default:
            return state;
    }
}
