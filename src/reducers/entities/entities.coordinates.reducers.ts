import { Action } from '@ngrx/store';
import { AuthActions } from '../../pages/auth/auth.actions';
import { MatesActions } from '../../pages/mates/mates.actions';
const dotProp = require('dot-prop-immutable');

export default function (state = {}, action: Action) {
    switch (action.type) {
        case AuthActions.LOGIN_SUCCESS:
        case AuthActions.UPDATE_SUCCESS:
        case MatesActions.DETAILS_REQ_SUCCESS:
        case MatesActions.SEARCH_SUCCESS:
            const entities = action.payload.data.entities.coordinates;
            if (entities && Object.keys(entities).length > 0) {
                return Object.assign({}, state, entities);
            }
            return state;

        default:
            return state;
    }
}
