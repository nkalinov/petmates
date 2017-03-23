import { Injectable } from '@angular/core';
// import { Network } from '@ionic-native';
import { Platform } from 'ionic-angular';

@Injectable()
export class ConnectivityService {
    onDevice: boolean;

    constructor(public platform: Platform) {
        this.onDevice = this.platform.is('cordova');
    }

    isOnline() {
        // if (this.onDevice && Network.type) {
        //     return Network.type !== Connection.NONE;
        // } else {
        //     return navigator.onLine;
        // }
    }

    isOffline() {
        // if (this.onDevice && Network.type) {
        //     return Network.type === Connection.NONE;
        // } else {
        //     return !navigator.onLine;
        // }
    }
}
