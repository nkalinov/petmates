import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { PetsActions } from './pets.actions';
import { AppActions } from '../../app/app.actions';
import { PetsService } from './pets.service';

@Injectable()
export class PetsEffects {
    constructor(private actions$: Actions,
                private petsService: PetsService,
                private appActions: AppActions,
                private petsActions: PetsActions) {
    }

    @Effect()
    update$ = this.actions$
        .ofType(PetsActions.UPDATE)
        .map(toPayload)
        .switchMap(({ pet, index }) =>
            this.petsService.update(pet)
                .map(res =>
                    res.success
                        ? this.petsActions.updateSuccess(pet, index)
                        : this.appActions.error(res.msg)
                )
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        );
}
