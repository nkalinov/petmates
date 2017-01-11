import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { Walk } from '../models/Walk';
import { AuthService } from './auth.service';
import { Pet } from '../models/Pet';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SocketService } from './socket.service';
import { LocalNotifications } from 'ionic-native';
import { MatesService } from './mates.service';
import { IFriendship } from '../models/interfaces/IFriendship';
import { WalkMarkerIcon } from '../common/icons';

@Injectable()
export class WalkService {
    walks: Array<Walk> = [];
    walks$: any = new BehaviorSubject([]);

    walk = new Walk();
    marker: L.Marker;

    private mustEmitCoords: boolean = true;
    private emitCoordsInterval: any;

    constructor(private config: Config,
                private auth: AuthService,
                private mates: MatesService,
                private sockets: SocketService) {
    }

    init(coords: any, marker: L.Marker) {
        this.walk.user = this.auth.user.toPartial();
        // this.updateCurrentWalkCoords(coords);
        this.marker = marker;
    }

    start(petId: string) {
        this.walk.start(
            this.auth.user.pets.find((p: Pet) => p._id === petId)
        );

        // emit start event
        this.sockets.socket.emit('walk:start', this.walk);

        // change my marker's icon
        this.marker.setIcon(new WalkMarkerIcon({
            iconUrl: `${this.walk.pet.pic || this.config.get('defaultPetImage')}`,
            className: 'my-marker'
        }));

        // start emitting my coordinates
        this.emitCoordsInterval = setInterval(() => {
            this.emitCoords();
        }, 15 * 1000);
    }

    stop() {
        if (this.walk.started) {
            this.walk.pet = null;
            this.sockets.socket.emit('walk:stop');
            this.marker.setIcon(new WalkMarkerIcon({
                iconUrl: `${this.auth.user.pic || this.config.get('defaultMateImage')}`,
                className: 'my-marker'
            }));
            clearInterval(this.emitCoordsInterval);
            this.walk.stop();
        }
    }

    move(coords: L.LatLngExpression) {
        this.walk.coords = coords;
        this.marker.setLatLng(coords);
    }

    getCurrentWalkCoords() {
        return this.walk.coords;
    }

    // updateCurrentWalkCoords(coords: any, emit: boolean = false): void {
    //     this.walk.coords = coords;
    //     this.mustEmitCoords = emit;
    // }

    registerSocketEvents(socket) {
        // see if one of my mates.accepted is going out for a walk
        socket.on('walk:start', (data: Walk) => {
            console.info('walk:start', data);
            let find = this.mates.mates.accepted.find((f: IFriendship) => f.friend._id === data.user._id);
            if (find) {
                LocalNotifications.schedule({
                    id: 1,
                    text: `${data.user.name} is out with ${data.pet.name}.`
                });
            }
        });

        socket.on('walks', (data: Array<Walk> = []) => {
            console.info('walks', data);
            if (this.walk.started || this.walks.length === 0) {
                this.walks = data.map((w) => new Walk(w));
                this.walks$.next(this.walks);
            }
        });
    }

    private emitCoords() {
        if (this.mustEmitCoords) {
            this.sockets.socket.emit('walk:move', this.walk.coords);
            console.info('emit walks:move', this.walk.coords);
            this.mustEmitCoords = false;
        }
    }
}
