import { Action } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Pet } from '../../models/Pet';

@Injectable()
export class PetsActions {
    save(pet: Pet, index: number): Action {
        return pet._id
            ? this.update(pet, index)
            : this.create(pet);
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

    create(pet: Pet): Action {
        return {
            type: PetsActions.CREATE,
            payload: {
                pet
            }
        };
    }

    static CREATE_SUCCESS = 'PET_CREATE_SUCCESS';

    createSuccess(pet: Pet): Action {
        return {
            type: PetsActions.CREATE_SUCCESS,
            payload: {
                pet
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

    remove(id: string, index: number): Action {
        return {
            type: PetsActions.REMOVE,
            payload: {
                id,
                index
            }
        };
    }

    static REMOVE_SUCCESS = 'PET_REMOVE_SUCCESS';

    removeSuccess(index: number): Action {
        return {
            type: PetsActions.REMOVE_SUCCESS,
            payload: {
                index
            }
        };
    }
}
