import {Pet} from './pet.model';
import {Friendship} from './friendship.interface.ts';

export class User {
    _id:string;
    name:string;
    email:string;
    password:string;
    pic:string; // filename with url
    pets:Array<Pet>;
    mates:Array<Friendship>;

    lastActive:Date = null;

    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
