import { Action } from '@ngrx/store';
import { AuthActions } from '../../pages/auth/auth.actions';
import { PetsActions } from '../../pages/pets/pets.actions';
const dotProp = require('dot-prop-immutable');

export default function (state = {}, action: Action) {
    switch (action.type) {
        case AuthActions.LOGIN_SUCCESS:
        case AuthActions.UPDATE_SUCCESS:
            return Object.assign({}, state, action.payload.data.entities.users);

        case PetsActions.CREATE_SUCCESS:
            return dotProp.set(state, `${action.payload.userId}.pets`, pets => [
                action.payload.pet._id,
                ...pets
            ]);

        case PetsActions.REMOVE_SUCCESS:
            const index = state[action.payload.userId].pets.indexOf(action.payload.petId);
            return dotProp.delete(state, `${action.payload.userId}.pets.${index}`);

        default:
            return state;
    }
}
