import LatLngExpression = L.LatLngExpression;
import {Pet} from './pet.model';
import {User} from "./user.model";
import Marker = L.Marker;

export interface Walk {
    id:string;
    user?:{
        name:string
    };
    coords?:LatLngExpression;
    pet?:{
        name:string,
        breed:{name:string},
        birthday:Date,
        pic:string
    };
}