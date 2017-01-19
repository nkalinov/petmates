import { IWalkPet } from './interfaces/IWalkPet';
import { IUserPartial } from './interfaces/IUserPartial';
import { IWalkPartial } from './interfaces/IWalkPartial';
const uuid = require('uuid/v4');

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

    toPartial(): IWalkPartial {
        return {
            id: this.id,
            user: this.user,
            coords: this.coords,
            pet: this.pet
        };
    }
}
