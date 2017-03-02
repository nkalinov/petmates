import { Action } from '@ngrx/store';
import { Pet } from '../../models/Pet';

export class PetsActions {
    static save(pet: Pet, index: number): Action {
        return pet._id
            ? PetsActions.update(pet, index)
            : PetsActions.create(pet);
    }

    static UPDATE = 'PET_UPDATE';

    static update(pet: Pet, index: number): Action {
        return {
            type: PetsActions.UPDATE,
            payload: {
                pet,
                index
            }
        };
    }

    static CREATE = 'PET_CREATE';

    static create(pet: Pet): Action {
        return {
            type: PetsActions.CREATE,
            payload: {
                pet
            }
        };
    }

    static CREATE_SUCCESS = 'PET_CREATE_SUCCESS';

    static createSuccess(pet: Pet): Action {
        return {
            type: PetsActions.CREATE_SUCCESS,
            payload: {
                pet
            }
        };
    }

    static UPDATE_SUCCESS = 'PET_UPDATE_SUCCESS';

    static updateSuccess(pet: Pet, index: number): Action {
        return {
            type: PetsActions.UPDATE_SUCCESS,
            payload: {
                pet,
                index
            }
        };
    }

    static REMOVE = 'PET_REMOVE';

    static remove(id: string, index: number): Action {
        return {
            type: PetsActions.REMOVE,
            payload: {
                id,
                index
            }
        };
    }

    static REMOVE_SUCCESS = 'PET_REMOVE_SUCCESS';

    static removeSuccess(index: number): Action {
        return {
            type: PetsActions.REMOVE_SUCCESS,
            payload: {
                index
            }
        };
    }
}
