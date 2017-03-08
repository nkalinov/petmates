import { Action } from '@ngrx/store';
import { Pet } from '../../models/Pet';

export class PetsActions {
    static save(pet: Pet, userId: string): Action {
        return pet._id
            ? PetsActions.update(pet)
            : PetsActions.create(pet, userId);
    }

    static UPDATE = 'PET_UPDATE';

    static update(pet: Pet): Action {
        return {
            type: PetsActions.UPDATE,
            payload: {
                pet
            }
        };
    }

    static CREATE = 'PET_CREATE';

    static create(pet: Pet, userId: string): Action {
        return {
            type: PetsActions.CREATE,
            payload: {
                pet,
                userId
            }
        };
    }

    static CREATE_SUCCESS = 'PET_CREATE_SUCCESS';

    static createSuccess(pet: Pet, userId: string): Action {
        return {
            type: PetsActions.CREATE_SUCCESS,
            payload: {
                pet,
                userId
            }
        };
    }

    static UPDATE_SUCCESS = 'PET_UPDATE_SUCCESS';

    static updateSuccess(pet: Pet): Action {
        return {
            type: PetsActions.UPDATE_SUCCESS,
            payload: {
                pet
            }
        };
    }

    static REMOVE = 'PET_REMOVE';

    static remove(petId: string, userId: string): Action {
        return {
            type: PetsActions.REMOVE,
            payload: {
                petId,
                userId
            }
        };
    }

    static REMOVE_SUCCESS = 'PET_REMOVE_SUCCESS';

    static removeSuccess(petId: string, userId: string): Action {
        return {
            type: PetsActions.REMOVE_SUCCESS,
            payload: {
                petId,
                userId
            }
        };
    }
}
