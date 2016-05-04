import {Injectable} from 'angular2/core';
import {Config} from 'ionic-angular/index';
import {Socket} from 'net';
import LatLngExpression = L.LatLngExpression;
import {Walk} from '../models/walk.interface';
import {AuthService} from './auth.service';
import {Pet} from '../models/pet.model';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import Marker = L.Marker;
import {SocketService} from "./socket.service";
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
    walks:Array<Walk>;
    walks$:any = new BehaviorSubject([]);
    currentWalk:Walk = {
        id: uuid.v1()
    };
    currentWalkMarker:Marker;
    emitCoordsInterval:any;

    constructor(private config:Config,
                private auth:AuthService,
                private sockets:SocketService) {
    }

    init(coords:LatLngExpression, marker:Marker):void {
        this.currentWalk.user = {
            name: this.auth.user.name
        };
        this.currentWalk.coords = coords;
        this.currentWalkMarker = marker;

        // subscribe to walks public event
        this.sockets.socket.on('walks', (data) => {
            this.walks = data;
            this.walks$.next(this.walks);
        });

        // get walks
        this.sockets.socket.emit('walks');
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

        // subscribe to others updates
        this.initPrivateSocketEventHandlers();

        // start emitting my coords every n sec
        this.emitCoordsInterval = setInterval(() => {
            this.sockets.socket.emit('walk:move', this.currentWalk);
        }, this.config.get('emitCoordsIntervalMs'));
    }

    /**
     * Stop current walk
     */
    stop() {
        this.currentWalk.pet = null;
        this.sockets.socket.emit('walk:stop');
        this.currentWalkMarker.setIcon(new UserIcon({iconUrl: `${this.auth.user.pic || this.config.get('defaultMateImage')}`}));

        // stop sending my moves
        clearInterval(this.emitCoordsInterval);

        // unsubscribe from private events
        this.removePrivateSocketEventHandlers();
    }

    getCurrentCoords():LatLngExpression {
        return this.currentWalk.coords;
    }

    setCurrentCoords(coords:LatLngExpression):void {
        this.currentWalk.coords = coords;
    }

    ////////////////////////////////

    // must store the handlers separately as .bind() changes the ref
    private walkMoveHandlerRef = this.walkMoveHandler.bind(this);
    private walkStopHandlerRef = this.walkStopHandler.bind(this);

    private removePrivateSocketEventHandlers() {
        this.sockets.socket.removeListener('walk:start', this.walkMoveHandlerRef);
        this.sockets.socket.removeListener('walk:move', this.walkMoveHandlerRef);
        this.sockets.socket.removeListener('walk:stop', this.walkStopHandlerRef);
    }

    private initPrivateSocketEventHandlers() {
        this.sockets.socket.on('walk:start', this.walkMoveHandlerRef);
        this.sockets.socket.on('walk:move', this.walkMoveHandlerRef);
        this.sockets.socket.on('walk:stop', this.walkStopHandlerRef);
    }

    private walkStopHandler(walk:Walk) {
        console.info('walk:stop', walk);
        let index = this.walks.findIndex((w) => walk.id === w.id);
        if (index > -1) {
            this.walks.splice(index, 1);
            this.walks$.next(this.walks);
        }
    }

    private walkMoveHandler(walk:Walk) {
        let find:Walk = this.walks.find((w:Walk) => {
            return w.id === walk.id;
        });
        if (find) {
            find.coords = walk.coords;
        } else {
            this.walks.push(walk);
        }
        this.walks$.next(this.walks);
    }
}