const uuid = require('uuid/v4');
import { IUserPartial } from './interfaces/IUserPartial';
import { IWalkPet } from './interfaces/IWalkPet';

export class Walk {
    id: string;
    user: IUserPartial;
    coords: L.LatLngExpression;
    pet: IWalkPet;
    marker: L.Marker;

    started: boolean = false;

    constructor(data?) {
        Object.assign(this, data);
    }

    start() {
        this.id = uuid();
        this.started = true;
    }

    stop() {
        this.started = false;
    }

    move(coords: L.LatLngExpression) {
        this.coords = coords;
        this.marker.setLatLng(this.coords);
    }
}
