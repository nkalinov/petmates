import { Action } from '@ngrx/store';
import { User } from '../../models/User';
import { normalize } from 'normalizr';
import { userEntity } from '../../app/schemas';

export class MatesActions {
    static SEARCH = 'MATES_SEARCH';

    static search(query: string): Action {
        return {
            type: MatesActions.SEARCH,
            payload: query
        };
    }

    static SEARCH_SUCCESS = 'MATES_SEARCH_SUCCESS';

    static searchSuccess(results: User[]): Action {
        return {
            type: MatesActions.SEARCH_SUCCESS,
            payload: {
                data: normalize(results, [userEntity])
            }
        };
    }

    static ADD = 'MATES_ADD';

    static add(userId: string, friendId: string): Action {
        return {
            type: MatesActions.ADD,
            payload: {
                userId,
                friendId
            }
        };
    }

    static ADD_SUCCESS = 'MATES_ADD_SUCCESS';
    static SOCKET_ADD_SUCCESS = 'SOCKET_MATES_ADD_SUCCESS';

    static addSuccess(userId: string, friendId: string): Action {
        return {
            type: MatesActions.ADD_SUCCESS,
            payload: {
                userId,
                friendId
            }
        };
    }

    static REMOVE = 'MATES_REMOVE';

    static remove(userId: string, friendId: string): Action {
        return {
            type: MatesActions.REMOVE,
            payload: {
                userId,
                friendId
            }
        };
    }

    static REMOVE_SUCCESS = 'MATES_REMOVE_SUCCESS';

    static removeSuccess(userId: string, friendId: string): Action {
        return {
            type: MatesActions.REMOVE_SUCCESS,
            payload: {
                userId,
                friendId
            }
        };
    }

    static DETAILS_REQ = 'DETAILS_REQ';

    static getUserDetails(userId: string): Action {
        return {
            type: MatesActions.DETAILS_REQ,
            payload: userId
        }
    }

    static DETAILS_REQ_SUCCESS = 'DETAILS_REQ_SUCCESS';

    static getUserDetailsSuccess(user: User): Action {
        return {
            type: MatesActions.DETAILS_REQ_SUCCESS,
            payload: {
                data: normalize(user, userEntity)
            }
        }
    }
}
