import { Action } from '@ngrx/store';

export class ApiActions {
    static UPLOAD = 'API_UPLOAD';

    static upload(): Action {
        return {
            type: ApiActions.UPLOAD
        };
    }

    static UPLOAD_SUCCESS = 'API_UPLOAD_SUCCESS';

    static uploadSuccess(): Action {
        return {
            type: ApiActions.UPLOAD_SUCCESS
        };
    }
}
