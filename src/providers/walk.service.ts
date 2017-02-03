import { Injectable } from '@angular/core';
import { Walk } from '../models/Walk';
import { AuthService } from '../pages/auth/auth.service';
import { Pet } from '../models/Pet';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SocketService } from './socket.service';
import { LocalNotifications } from 'ionic-native';
import { MatesService } from './mates.service';
import { IFriendship } from '../models/interfaces/IFriendship';
import { userIcon, petIcon } from '../utils/icons';
import { AppState } from '../app/state';
import { Store } from '@ngrx/store';
import { User } from '../models/User';

@Injectable()
export class WalkService {
    walk = new Walk(); // my walk
    walksById = {}; // saved walks by id
    walks$;
    private walks: BehaviorSubject<Walk[]> = new BehaviorSubject([]);
    private stopEmitCoords: Function;

    private user: User;

    constructor(private mates: MatesService,
                private sockets: SocketService,
                private store: Store<AppState>) {

        this.store.select(state => state.auth.user).subscribe(user => {
            this.user = user;
        });
        this.walks$ = this.walks.asObservable();
    }

    init(coords: L.LatLngExpression): L.Marker {
        this.walk = new Walk({
            coords,
            user: this.user,
            marker: L.marker(coords, {
                icon: userIcon(`${this.user.pic}`, 'my-marker')
            })
        });

        return this.walk.marker;
    }

    start(petId: string) {
        this.walk.pet = this.user.pets.find((p: Pet) => p._id === petId).toPartial();
        this.walk.start();
        this.sockets.socket.emit('walks:start', this.walk.toPartial());
        this.walk.marker.setIcon(petIcon(this.walk.pet.pic, 'my-marker'));
        this.stopEmitCoords = this.startEmitCoords(this.walk.coords);
    }

    stop() {
        if (this.walk.started) {
            this.sockets.socket.emit('walks:stop');
            this.stopEmitCoords();
            this.walk.stop();
            this.walk.pet = null;
            this.walk.marker.setIcon(userIcon(this.user.pic, 'my-marker'));
        }
    }

    move(coords: L.LatLngExpression) {
        this.walk.move(coords);
    }

    requestWalks() {
        // only for the initial population
        if (!this.walks.getValue().length) {
            this.sockets.socket.emit('walks:get');
        }
    }

    registerSocketEvents(socket) {
        socket.on('walks:get', walks => {
            this.walks.next(
                walks.map(walk => {
                    if (walk.id !== this.walk.id) {
                        this.walksById[walk.id] = new Walk(walk);
                        return this.walksById[walk.id]; // ref
                    }
                })
            );
        });

        socket.on('walks:start', (data: Walk) => {
            console.info('walks:start <', data);
            // append new walks
            this.walksById[data.id] = new Walk(data);
            this.walks.next([
                    ...this.walks.getValue(),
                    this.walksById[data.id]
                ]
            );

            // see if one of my mates.accepted is going out for a walk
            let find = this.mates.mates.accepted.find((f: IFriendship) => f.friend._id === data.user._id);
            if (find) {
                LocalNotifications.schedule({
                    id: 1,
                    text: `${data.user.name} is out with ${data.pet.name}.`
                });
            }
        });

        socket.on('walks:stop', (id: string) => {
            console.info('walks:stop <', id);
            const index = this.walks.getValue().indexOf(this.walksById[id]);
            delete this.walksById[id];

            if (index > -1) {
                this.walks.next([
                        ...this.walks.getValue().slice(0, index),
                        ...this.walks.getValue().slice(index + 1)
                    ]
                );
            }
        });

        socket.on('walks:coords', data => {
            console.info('walks:coords <', data);
            data.forEach(obj => {
                const walkId = Object.keys(obj)[0];
                if (walkId !== this.walk.id) {
                    this.walksById[walkId].move(obj[walkId]);
                }
            });
        });
    }

    private startEmitCoords(coords: L.LatLngExpression): Function {
        let lastCoords = coords,
            id = setInterval(() => {
                if (lastCoords !== this.walk.coords) {
                    this.sockets.socket.emit('walks:move', this.walk.coords);
                    lastCoords = this.walk.coords;
                    console.info('walks:move >', this.walk.coords);
                }
            }, 15 * 1000);

        return () => clearInterval(id);
    }
}
