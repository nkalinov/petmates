import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { Walk } from '../models/walk.model';
import { AuthService } from './auth.service';
import { Pet } from '../models/pet.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SocketService } from './socket.service';
import { LocalNotifications } from 'ionic-native';
import { MatesService } from './mates.service';
import { IFriendship } from '../models/IFriendship';
import { UserIcon, vetIcon } from '../common/icons';

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

    init(coords: any, marker: L.Marker): void {
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
            iconUrl: `${this.currentWalk.pet.pic || this.config.get('defaultPetImage')}`,
            className: 'my-marker'
        }));

        // start emitting my coordinates
        this.emitCoordsInterval = setInterval(() => {
            this.emitCoords();
        }, 15 * 1000);
    }

    stop() {
        if (this.currentWalk.started) {
            this.currentWalk.pet = null;
            this.sockets.socket.emit('walk:stop');
            this.currentWalkMarker.setIcon(new UserIcon({
                iconUrl: `${this.auth.user.pic || this.config.get('defaultMateImage')}`,
                className: 'my-marker'
            }));
            clearInterval(this.emitCoordsInterval);
            this.currentWalk.stop();
        }
    }

    getCurrentWalkCoords() {
        return this.currentWalk.coords;
    }

    updateCurrentWalkCoords(coords: any, emit: boolean = false): void {
        this.currentWalk.coords = coords;
        this.mustEmitCoords = emit;
    }

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
