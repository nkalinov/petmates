import { IWalkPet } from './interfaces/IWalkPet';
import { IWalkPartial } from './interfaces/IWalkPartial';
import { User } from './User';
const uuid = require('uuid/v4');

export class Walk {
    id: string;
    user: User;
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
            user: this.user.toPartial(),
            coords: this.coords,
            pet: this.pet
        };
    }
}
