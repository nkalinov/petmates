import { Action } from '@ngrx/store';
import { SocketActions } from '../actions/socket.actions';
const dotProp = require('dot-prop-immutable');

export default function (state = {}, action: Action) {
    switch (action.type) {
        case SocketActions.LAST_ACTIVITIES_SUCCESS:
            return action.payload;

        default:
            return state;
    }
}
