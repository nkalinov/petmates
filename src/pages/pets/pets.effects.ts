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
    create$ = this.actions$
        .ofType(PetsActions.CREATE)
        .map(toPayload)
        .switchMap(pet =>
            this.petsService.create(pet)
                .map(res =>
                    res.success
                        ? this.petsActions.createSuccess(pet)
                        : this.appActions.error(res.msg)
                )
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        );

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

    @Effect()
    remove$ = this.actions$
        .ofType(PetsActions.REMOVE)
        .map(toPayload)
        .switchMap(({ id, index }) =>
            this.petsService.remove(id)
                .map(res =>
                    res.success
                        ? this.petsActions.removeSuccess(index)
                        : this.appActions.error(res.msg)
                )
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        );
}
