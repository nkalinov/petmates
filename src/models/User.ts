import { Pet } from './Pet';
import { IFriendship } from './interfaces/IFriendship';
import { IUserPartial } from './interfaces/IUserPartial';

export class User {
    readonly _id: string;
    name: string;
    email: string;
    password: string;
    picture: string; // filename
    pic: string; // picture url
    pets: any[] = []; // string[] | Pet[] = [];
    mates: Array<IFriendship> = [];
    city: string = '';
    region: string = '';
    country: string = '';
    location: {
        coordinates: Array<number> // [lon, lat]
    } = {
        coordinates: undefined
    };

    lastActive: Date;
    distance?: number;

    constructor(data?) {
        Object.assign(this, data);

        if (data) {
            if (this.password) {
                delete this.password;
            }
            this.mates.forEach(mate => {
                mate.friend = new User(mate.friend);
            });
            this.pets = this.pets.map(pet => new Pet(pet));
        }
    }

    toPartial(): IUserPartial {
        return {
            _id: this._id,
            name: this.name,
            pic: this.pic
        };
    }

    toString() {
        return this._id;
    }
}
