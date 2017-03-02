import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

export class SocketActions {
    static CONNECTED = 'SOCKET_CONNECTED';

    static connected(socket): Action {
        return {
            type: SocketActions.CONNECTED,
            payload: socket
        };
    }

    static DISCONNECT = 'SOCKET_DISCONNECT';

    static disconnected(): Action {
        return {
            type: SocketActions.DISCONNECT
        };
    }
}
