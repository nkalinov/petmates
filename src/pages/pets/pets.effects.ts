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
        .switchMap(({ pet, userId }) =>
            this.petsService.create(pet)
                .map(res =>
                    res.success
                        ? PetsActions.createSuccess(res.data, userId)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        )
        .share();

    @Effect()
    update$ = this.actions$
        .ofType(PetsActions.UPDATE)
        .map(toPayload)
        .switchMap(({ pet }) =>
            this.petsService.update(pet)
                .map(res =>
                    res.success
                        ? PetsActions.updateSuccess(pet)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        )
        .share();

    @Effect()
    remove$ = this.actions$
        .ofType(PetsActions.REMOVE)
        .map(toPayload)
        .switchMap(({ petId, userId }) =>
            this.petsService.remove(petId)
                .map(res =>
                    res.success
                        ? PetsActions.removeSuccess(petId, userId)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        )
        .share();
}
