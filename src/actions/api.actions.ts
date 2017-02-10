import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class ApiActions {
    static UPLOAD = 'API_UPLOAD';

    upload(): Action {
        return {
            type: ApiActions.UPLOAD
        };
    }

    static UPLOAD_SUCCESS = 'API_UPLOAD_SUCCESS';

    uploadSuccess(): Action {
        return {
            type: ApiActions.UPLOAD_SUCCESS
        };
    }
}
