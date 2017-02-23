import { IBreed } from './interfaces/IBreed';
import { IWalkPet } from './interfaces/IWalkPet';

export class Pet {
    readonly _id: string;
    name: string;
    sex: string;
    breed: IBreed = {
        _id: '',
        name: ''
    };
    pic: string;
    picture: string;
    birthday: Date;
    distance: number;

    constructor(data?) {
        Object.assign(this, data);
    }

    toPartial(): IWalkPet {
        return {
            name: this.name,
            breed: {
                name: this.breed.name
            },
            pic: this.pic
        };
    }
}
