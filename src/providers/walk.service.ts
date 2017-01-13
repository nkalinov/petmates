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
import { WalkMarkerIcon, userIcon, petIcon } from '../utils/icons';

@Injectable()
export class WalkService {
    walks$: BehaviorSubject<Walk[]> = new BehaviorSubject([]);
    walk = new Walk();
    marker: L.Marker;

    private emitCoordsInterval: any;

    constructor(private config: Config,
                private auth: AuthService,
                private mates: MatesService,
                private sockets: SocketService) {
    }

    init(coords: L.LatLngExpression): L.Marker {
        this.walk = new Walk({
            coords,
            user: this.auth.user.toPartial(),
            marker: L.marker(coords, {
                icon: userIcon(`${this.auth.user.pic}`, 'my-marker')
            })
        });

        return this.walk.marker;
    }

    start(petId: string) {
        // set pet
        const pet = this.auth.user.pets.find((p: Pet) => p._id === petId);
        this.walk.pet = {
            name: pet.name,
            breed: {
                name: pet.breed.name
            },
            pic: pet.pic
        };

        this.walk.start();
        this.sockets.socket.emit('walk:start', this.walk);

        // change my marker's icon
        this.walk.marker.setIcon(petIcon(this.walk.pet.pic, 'my-marker'));

        // start emitting my coordinates
        this.emitCoordsInterval = setInterval(() => {
            this.emitCoords();
        }, 15 * 1000);
    }

    stop() {
        if (this.walk.started) {
            this.walk.pet = null;
            this.sockets.socket.emit('walk:stop');
            this.walk.marker.setIcon(userIcon(this.auth.user.pic, 'my-marker'));
            clearInterval(this.emitCoordsInterval);
            this.walk.stop();
        }
    }

    registerSocketEvents(socket) {
        // see if one of my mates.accepted is going out for a walk
        socket.on('walk:start', (data: Walk) => {
            console.info('walk:start <', data);
            let find = this.mates.mates.accepted.find((f: IFriendship) => f.friend._id === data.user._id);
            if (find) {
                LocalNotifications.schedule({
                    id: 1,
                    text: `${data.user.name} is out with ${data.pet.name}.`
                });
            }
        });

        socket.on('walks', (data: Array<Walk> = []) => {
            console.info('walks <', data);

            // refresh walks only if I'm on walk too OR if this is the first message
            if (this.walk.started || this.walks$.getValue().length === 0) {
                this.walks$.next(
                    data.map(w => new Walk(w))
                );
            }
        });
    }

    private emitCoords() {
        this.sockets.socket.emit('walk:move', this.walk.coords);
        console.info('walks:move >', this.walk.coords);
    }
}
