import {Pet} from './pet.model';

export interface UserInterface {
    _id:string;
    name:string;
    picture?:string;
    pets:Array<Pet>;
}