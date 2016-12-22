import { Breed } from './IBreed';

export class Pet {
    _id: string;
    name: string;
    sex: string = 'm';
    breed: Breed = {
        _id: '',
        name: ''
    };
    pic: string;
    picture: string;
    birthday: Date = new Date();

    distance?: string;

    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }

        if (data.distance) {
            this.setDistance(data.distance);
        }
    }

    setDistance(dis: number) {
        if (dis) {
            this.distance = dis < 1000 ?
                dis.toFixed().toString() + ' m' :
                (dis / 1000).toFixed(1).toString() + ' km';
        }
    }
}

export interface NearbyPet {
    readonly _id: string;
    name: string;
    pic: string;
    distance: string;
    city: string;

    pet: Pet;
}
