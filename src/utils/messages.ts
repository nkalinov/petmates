import { AuthActions } from '../pages/auth/auth.actions';
import { Action } from '@ngrx/store';

const messages = {
    [AuthActions.UPDATE]: 'Updating your profile...',
    [AuthActions.UPDATE_SUCCESS]: 'Profile updated!'
};

export function getLoaderMessage(action: Action) {
    return messages[action.type] || 'Please wait';
}

export function getToastMessage(action: Action) {
    switch (action.type) {
        case AuthActions.FORGOT_REQ_SUCCESS:
            return action.payload;
        default:
            return messages[action.type] || 'Success';
    }
}
