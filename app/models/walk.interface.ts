import LatLngExpression = L.LatLngExpression;
import Marker = L.Marker;

export interface Walk {
    id?:string;
    user?:{
        _id:string,
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