import { Action } from '@ngrx/store';

export class SocketActions {
    static EMIT = 'SOCKET_EMIT';

    static emit(action: Action): Action {
        return {
            type: SocketActions.EMIT,
            payload: action
        }
    }

    static CONNECT_SUCCESS = 'SOCKET_CONNECT_SUCCESS';

    static connectSuccess(socket): Action {
        return {
            type: SocketActions.CONNECT_SUCCESS,
            payload: socket
        };
    }

    static CONNECT_ERROR = 'SOCKET_CONNECT_ERROR';

    static connectError(err): Action {
        return {
            type: SocketActions.CONNECT_ERROR,
            payload: err
        };
    }

    static DISCONNECT = 'SOCKET_DISCONNECT';

    static disconnect(): Action {
        return {
            type: SocketActions.DISCONNECT
        };
    }
}
