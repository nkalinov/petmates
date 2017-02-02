import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class AppActions {
    static UNHANDLED = 'UNHANDLED';
    static APP_ERROR = 'APP_ERROR';

    unhandled(): Action {
        return {
            type: AppActions.UNHANDLED
        };
    }

    error(msg: string): Action {
        return {
            type: AppActions.APP_ERROR,
            payload: {
                msg
            }
        };
    }
}
