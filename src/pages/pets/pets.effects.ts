import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { PetsActions } from './pets.actions';
import { AppActions } from '../../app/app.actions';
import { PetsService } from './pets.service';

@Injectable()
export class PetsEffects {
    constructor(private actions$: Actions,
                private petsService: PetsService) {
    }

    @Effect()
    create$ = this.actions$
        .ofType(PetsActions.CREATE)
        .map(toPayload)
        .switchMap(({ pet }) =>
            this.petsService.create(pet)
                .map(res =>
                    res.success
                        ? PetsActions.createSuccess(res.data)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        )
        .share();

    @Effect()
    update$ = this.actions$
        .ofType(PetsActions.UPDATE)
        .map(toPayload)
        .switchMap(({ pet, index }) =>
            this.petsService.update(pet)
                .map(res =>
                    res.success
                        ? PetsActions.updateSuccess(pet, index)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        )
        .share();

    @Effect()
    remove$ = this.actions$
        .ofType(PetsActions.REMOVE)
        .map(toPayload)
        .switchMap(({ id, index }) =>
            this.petsService.remove(id)
                .map(res =>
                    res.success
                        ? PetsActions.removeSuccess(index)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        )
        .share();
}
