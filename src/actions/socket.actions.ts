import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class SocketActions {
    static CONNECTED = 'SOCKET_CONNECTED';
    static DISCONNECT = 'SOCKET_DISCONNECT';

    connected(socket): Action {
        return {
            type: SocketActions.CONNECTED,
            payload: socket
        };
    }

    disconnected(): Action {
        return {
            type: SocketActions.DISCONNECT
        };
    }
}
