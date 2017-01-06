import { Pet } from './Pet';

export class NearbyPet {
    _id: string;
    name: string;
    pic: string;
    city: string;
    distance: number;
    pet: Pet;

    constructor(data?) {
        Object.assign(this, data);
    }
}
