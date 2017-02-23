import { Action } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Pet } from '../../models/Pet';

@Injectable()
export class PetsActions {
    save(payload: Pet, index: number): Action {
        return payload._id
            ? this.update(payload, index)
            : this.create(payload, index);
    }

    static UPDATE = 'PET_UPDATE';

    update(pet: Pet, index: number): Action {
        return {
            type: PetsActions.UPDATE,
            payload: {
                pet,
                index
            }
        };
    }

    static CREATE = 'PET_CREATE';

    create(pet: Pet, index: number): Action {
        return {
            type: PetsActions.CREATE,
            payload: {
                pet,
                index
            }
        };
    }

    static UPDATE_SUCCESS = 'PET_UPDATE_SUCCESS';

    updateSuccess(pet: Pet, index: number): Action {
        return {
            type: PetsActions.UPDATE_SUCCESS,
            payload: {
                pet,
                index
            }
        };
    }

    static REMOVE = 'PET_REMOVE';

    remove(): Action {
        return {
            type: PetsActions.REMOVE
        };
    }
}
