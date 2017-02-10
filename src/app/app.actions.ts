import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class AppActions {
    static APP_ERROR = 'APP_ERROR';

    error(msg: string): Action {
        return {
            type: AppActions.APP_ERROR,
            payload: msg
        };
    }
}
