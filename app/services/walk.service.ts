import {Injectable} from 'angular2/core';
import {Config} from 'ionic-angular/index';
import LatLngExpression = L.LatLngExpression;
import {Walk} from '../models/walk.interface';
import {AuthService} from './auth.service';
import {Pet} from '../models/pet.model';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import Marker = L.Marker;
import {SocketService} from "./socket.service";
import {LocalNotifications} from 'ionic-native';
import {MatesService} from "./mates.service";
import {Friendship} from "../models/friendship.interface";
const uuid = require('../../api/node_modules/node-uuid');

export var UserIcon = L.Icon.extend({
    options: {
        iconSize: [40, 40], // size of the icon
        iconAnchor: [20, 30], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
    }
});

@Injectable()
export class WalkService {
    walks:Array<Walk> = [];
    walks$:any = new BehaviorSubject([]);
    currentWalk:Walk = {};

    private emitCoords:boolean = true;
    private currentWalkMarker:Marker;
    private emitCoordsInterval:any;

    constructor(private config:Config,
                private auth:AuthService,
                private mates:MatesService,
                private sockets:SocketService) {
    }

    init(coords:LatLngExpression, marker:Marker):void {
        this.currentWalk = {
            id: uuid.v1(),
            user: {
                _id: this.auth.user._id,
                name: this.auth.user.name
            }
        };
        this.updateCurrentWalkCoords(coords);
        this.currentWalkMarker = marker;
    }

    /**
     * Start new walk with petId
     * @param petId
     */
    start(petId:string) {
        this.currentWalk.id = uuid.v1();
        let pet:Pet = this.auth.user.pets.find((p:Pet) => p._id === petId);
        this.currentWalk.pet = {
            name: pet.name,
            birthday: pet.birthday,
            breed: {
                name: pet.breed.name
            },
            pic: pet.pic
        };

        // emit start event
        this.sockets.socket.emit('walk:start', this.currentWalk);

        // change my marker's icon
        this.currentWalkMarker.setIcon(new UserIcon({iconUrl: `${this.currentWalk.pet.pic || this.config.get('defaultPetImage')}`}));

        // start emitting my coords every n sec
        this.emitCoordsInterval = setInterval(() => {
            if (this.emitCoords) {
                this.sockets.socket.emit('walk:move', this.currentWalk.coords);
                this.emitCoords = false;
            }
        }, this.config.get('emitCoordsIntervalMs'));
    }

    stop() {
        this.currentWalk.pet = null;
        this.sockets.socket.emit('walk:stop');
        this.currentWalkMarker.setIcon(new UserIcon({iconUrl: `${this.auth.user.pic || this.config.get('defaultMateImage')}`}));

        // stop emitting my coords
        clearInterval(this.emitCoordsInterval);
    }

    getCurrentWalkCoords():LatLngExpression {
        return this.currentWalk.coords;
    }

    updateCurrentWalkCoords(coords:LatLngExpression, emit:boolean = false):void {
        this.currentWalk.coords = coords;
        this.emitCoords = emit;
    }

    registerSocketEvents(socket) {
        socket.on('walks', (data:Array<Walk>) => {
            console.debug('walks', data);
            if (data.length > 0) {
                // todo refactor
                // see if one of my mates.accepted is going out for a walk
                this.mates.mates.accepted.forEach((mate:Friendship) => {
                    let mateWalk = data.find((walk:Walk) => walk.user._id === mate.friend._id);
                    if (mateWalk) {
                        // yes, mate is out for a walk
                        let wasOut = this.walks.find((walk:Walk) => walk.user._id === mate.friend._id);

                        if (!wasOut) {
                            // just going out
                            LocalNotifications.schedule({
                                id: 1,
                                text: `${mateWalk.user.name} is out for a walk with ${mateWalk.pet.name}.`
                            });
                        }
                    }
                });
            }

            this.walks = data;
            this.walks$.next(this.walks);
        });
    }

    ////////////////////////////////

    // must store the handlers separately as .bind() changes the ref
    // private walkMoveHandlerRef = this.walkMoveHandler.bind(this);
    // private walkStopHandlerRef = this.walkStopHandler.bind(this);
    //
    // private removePrivateSocketEventHandlers() {
    //     this.sockets.socket.removeListener('walk:start', this.walkMoveHandlerRef);
    //     this.sockets.socket.removeListener('walk:move', this.walkMoveHandlerRef);
    //     this.sockets.socket.removeListener('walk:stop', this.walkStopHandlerRef);
    // }
    //
    // private initPrivateSocketEventHandlers() {
    //     this.sockets.socket.on('walk:start', this.walkMoveHandlerRef);
    //     this.sockets.socket.on('walk:move', this.walkMoveHandlerRef);
    //     this.sockets.socket.on('walk:stop', this.walkStopHandlerRef);
    // }

    // private walkStopHandler(walk:Walk) {
    //     console.info('walk:stop', walk);
    //     let index = this.walks.findIndex((w) => walk.id === w.id);
    //     if (index > -1) {
    //         this.walks.splice(index, 1);
    //         this.walks$.next(this.walks);
    //     }
    // }
    //
    // private walkMoveHandler(walk:Walk) {
    //     let find:Walk = this.walks.find((w:Walk) => {
    //         return w.id === walk.id;
    //     });
    //     if (find) {
    //         find.coords = walk.coords;
    //     } else {
    //         // new walk
    //         this.walks.push(walk);
    //
    //         // todo this implies that we subscribe to walk:start event before we walk:start
    //         LocalNotifications.schedule({
    //             id: <any>walk.id,
    //             text: `${walk.user.name} is out for a walk with ${walk.pet.name}.`
    //         });
    //     }
    //     this.walks$.next(this.walks);
    // }
}