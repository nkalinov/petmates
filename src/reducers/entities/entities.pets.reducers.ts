import { Action } from '@ngrx/store';
import { PetsActions } from '../../pages/pets/pets.actions';
import { AuthActions } from '../../pages/auth/auth.actions';
import { MatesActions } from '../../pages/mates/mates.actions';
const dotProp = require('dot-prop-immutable');

export default function (state = {}, action: Action) {
    switch (action.type) {
        case AuthActions.LOGIN_SUCCESS:
        case MatesActions.DETAILS_REQ_SUCCESS:
            return Object.assign({}, state, action.payload.data.entities.pets);

        case PetsActions.CREATE_SUCCESS:
        case PetsActions.UPDATE_SUCCESS:
            return dotProp.set(state, action.payload.pet._id, action.payload.pet);

        case PetsActions.REMOVE_SUCCESS:
            return dotProp.delete(state, action.payload.petId);

        default:
            return state;
    }
}
