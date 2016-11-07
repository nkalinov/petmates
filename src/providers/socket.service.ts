import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { AuthService } from './auth.service';
const io = require('socket.io-client');

@Injectable()
export class SocketService {
    socket: any;

    constructor(private config: Config,
                private auth: AuthService) {
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    init() {
        return new Promise((resolve, reject) => {
            this.disconnect();
            if (!this.socket) {
                let socket = io.connect(`${this.config.get('API')}`);
                socket.on('connect', () => {
                    socket.on('authenticated', () => {
                        console.info('socket authenticated');
                        this.socket = socket;
                        // global socket event handlers

                        // socket.io.engine.on('heartbeat', () => {
                        //     console.log('heartbeat');
                        // });

                        resolve(this.socket);
                    }).emit('authenticate', { token: this.auth.token.split(' ')[1] }); // send the jwt
                });
            } else {
                resolve(this.socket);
            }
        });
    }
}
