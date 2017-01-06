import { IBreed } from './interfaces/IBreed';

export class Pet {
    _id: string;
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
}
