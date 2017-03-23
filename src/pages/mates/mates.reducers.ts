import { Action } from '@ngrx/store';
import { MatesActions } from './mates.actions';
const dotProp = require('dot-prop-immutable');

export function matesSearchResults(state = [], action: Action) {
    switch (action.type) {
        case MatesActions.SEARCH_SUCCESS:
            return action.payload.data.result;

        default:
            return state;
    }
}
