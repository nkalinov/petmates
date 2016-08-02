import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { Walk } from '../models/walk.model';
import { AuthService } from './auth.service';
import { Pet } from '../models/pet.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SocketService } from './socket.service';
import { LocalNotifications } from 'ionic-native';
import { MatesService } from './mates.service';
import { Friendship } from '../models/friendship.interface';

export const UserIcon = L.Icon.extend({
    options: {
        iconSize: [40, 40], // size of the icon
        iconAnchor: [20, 30], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
    }
});

@Injectable()
export class WalkService {
    walks: Array<Walk> = [];
    walks$: any = new BehaviorSubject([]);
    currentWalk: Walk = new Walk();

    private currentWalkMarker: L.Marker;
    private mustEmitCoords: boolean = true;
    private emitCoordsInterval: any;

    constructor(private config: Config,
                private auth: AuthService,
                private mates: MatesService,
                private sockets: SocketService) {
    }

    init(coords: L.LatLngExpression, marker: L.Marker): void {
        this.currentWalk.user = {
            _id: this.auth.user._id,
            name: this.auth.user.name
        };
        this.updateCurrentWalkCoords(coords);
        this.currentWalkMarker = marker;
    }

    /**
     * Start new walk
     * @param petId
     */
    start(petId: string) {
        // map pet
        let pet: Pet = this.auth.user.pets.find((p: Pet) => p._id === petId);
        this.currentWalk.start({
            name: pet.name,
            birthday: pet.birthday,
            breed: {
                name: pet.breed.name
            },
            pic: pet.pic
        });

        // emit start event
        this.sockets.socket.emit('walk:start', this.currentWalk);

        // change my marker's icon
        this.currentWalkMarker.setIcon(new UserIcon({
            iconUrl: `${this.currentWalk.pet.pic || this.config.get('defaultPetImage')}`
        }));

        // start emitting my coordinates
        this.emitCoordsInterval = setInterval(() => {
            this.emitCoords();
        }, this.config.get('emitCoordsIntervalMs'));
    }

    stop() {
        if (this.currentWalk.started) {
            this.currentWalk.pet = null;
            this.sockets.socket.emit('walk:stop');
            this.currentWalkMarker.setIcon(new UserIcon({
                iconUrl: `${this.auth.user.pic || this.config.get('defaultMateImage')}`
            }));
            clearInterval(this.emitCoordsInterval);
            this.currentWalk.stop();
        }
    }

    getCurrentWalkCoords(): L.LatLngExpression {
        return this.currentWalk.coords;
    }

    updateCurrentWalkCoords(coords: L.LatLngExpression, emit: boolean = false): void {
        this.currentWalk.coords = coords;
        this.mustEmitCoords = emit;
    }

    registerSocketEvents(socket) {
        // see if one of my mates.accepted is going out for a walk
        socket.on('walk:start', (data: Walk) => {
            console.info('walk:start', data);
            let find = this.mates.mates.accepted.find((f: Friendship) => f.friend._id === data.user._id);
            if (find) {
                LocalNotifications.schedule({
                    id: 1,
                    text: `${data.user.name} is out with ${data.pet.name}.`
                });
            }
        });

        socket.on('walks', (data: Array<Walk> = []) => {
            console.info('walks', data);
            if (this.currentWalk.started || this.walks.length === 0) {
                this.walks = data.map((w) => new Walk(w));
                this.walks$.next(this.walks);
            }
        });
    }

    private emitCoords() {
        if (this.mustEmitCoords) {
            this.sockets.socket.emit('walk:move', this.currentWalk.coords);
            console.info('emit walks:move', this.currentWalk.coords);
            this.mustEmitCoords = false;
        }
    }
}
