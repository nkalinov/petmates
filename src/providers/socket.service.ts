import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { Observable } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { AppState } from '../app/state';
import { AuthService } from '../pages/auth/auth.service';
import { SocketActions } from '../actions/socket.actions';
const io = require('socket.io-client');

@Injectable()
export class SocketService {
    socket: any;
    private region: string;

    constructor(private config: Config,
                private authService: AuthService,
                private store: Store<AppState>) {

        // reconnect socket to proper room on region change
        this.authService.user$
            .withLatestFrom(this.store.select(state => state.auth))
            .subscribe(([user, auth]) => {
                if (auth.connected
                    && user.region !== this.region
                    && this.socket && this.socket.connected) {

                    this.disconnect();
                    this.connect(user.region, auth.token)
                        .subscribe(() => {
                            console.log('socket connected');
                        });
                }
            });

        this.onAction = this.onAction.bind(this);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    connect(region, token) {
        return Observable.create(observer => {
            if (this.socket && this.socket.connected) {
                observer.next(this.socket);
            } else {
                let socket = io.connect(`${this.config.get('API')}`, {
                    query: `region=${encodeURIComponent(region.toLowerCase())}`
                });
                socket
                    .on('connect', () => {
                        socket
                            .on('authenticated', () => {
                                this.socket = socket;
                                this.region = region;
                                this.registerEventHandlers();

                                observer.next(this.socket);
                            })
                            .emit('authenticate', { token: token.split(' ')[1] });
                    })
                    .on('disconnect', () => observer.complete())
                    .on('connect_error', err => observer.error(err))
                    .on('connect_timeout', () => observer.error('Socket connection timed out'));
            }

            return () => this.disconnect();
        });
    }

    emit(action: Action) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(action.type, action.payload);
        }
    }

    private registerEventHandlers() {
        this.socket.on('action', this.onAction);
    }

    private onAction(action: Action) {
        this.store.dispatch(action);
    }
}
