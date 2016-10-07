import LatLngExpression = L.LatLngExpression;
import Marker = L.Marker;
// import * as uuid from 'node-uuid/uuid.js';

export interface WalkPet {
    name: string;
    breed: {name: string};
    birthday: Date;
    pic: string;
}

export class Walk {
    id: string;
    user: {
        _id: string,
        name: string
    };
    coords: LatLngExpression;
    pet: WalkPet;
    started: boolean = false;

    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }

    stop() {
        this.started = false;
    }

    start(pet: WalkPet) {
        // this.id = (<any>uuid).v4();
        this.pet = pet;
        this.started = true;
    }
}
