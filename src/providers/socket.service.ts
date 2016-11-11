import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { AuthService } from './auth.service';
const io = require('socket.io-client');

@Injectable()
export class SocketService {
    socket: any;

    constructor(private config: Config,
                private auth: AuthService) {
        this.auth.regionUpdated.subscribe(region => {
            // reconnect socket to proper room on region change
            this.init(region);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    init(region) {
        return new Promise((resolve, reject) => {
            this.disconnect();

            if (!this.socket) {
                let socket = io.connect(`${this.config.get('API')}`, {
                    query: `region=${encodeURIComponent(region.toLowerCase())}`
                });
                socket.on('connect', () => {
                    socket.on('authenticated', () => {
                        this.socket = socket;
                        resolve(this.socket);
                    }).emit('authenticate', { token: this.auth.token.split(' ')[1] }); // send the jwt
                });
            } else {
                resolve(this.socket);
            }
        });
    }
}
