const uuid = require('uuid/v4');
import { IUserPartial } from './interfaces/IUserPartial';
import { Pet } from './Pet';
import { IWalkPet } from './interfaces/IWalkPet';

export class Walk {
    id: string;
    user: IUserPartial;
    coords: L.LatLngExpression;
    pet: IWalkPet;
    started: boolean = false;

    constructor(data?) {
        Object.assign(this, data);
    }

    start(pet: Pet) {
        this.id = uuid();

        this.pet = {
            name: pet.name,
            birthday: pet.birthday,
            breed: {
                name: pet.breed.name
            },
            pic: pet.pic
        };

        this.started = true;
    }

    stop() {
        this.started = false;
    }

    move(coords: L.LatLngExpression) {
        this.coords = coords;
    }
}
