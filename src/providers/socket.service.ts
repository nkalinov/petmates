import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { Observable } from 'rxjs';
const io = require('socket.io-client');

@Injectable()
export class SocketService {
    socket: any;

    constructor(private config: Config) {

        // todo reconnect socket to proper room on region change
        // this.store.select(state => state.auth).subscribe(auth => {
        //     if (auth.user) {
        //         // logged in OR updated
        //         this.connect(auth.region);
        //     } else {
        //         // logged out
        //         this.loggedOut();
        //     }
        // });

        // this.auth.regionUpdated.subscribe(this.connect);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    connect(region, token) {
        return Observable.create(observer => {
            this.disconnect();

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
                                observer.next(this.socket);
                            })
                            .emit('authenticate', { token: token.split(' ')[1] });
                    })
                    .on('disconnect', err => observer.complete())
                    .on('connect_error', err => observer.error(err))
                    .on('connect_timeout', () => observer.error('Socket connect_timeout'));
            }

            return () => this.disconnect();
        });
    }
}
