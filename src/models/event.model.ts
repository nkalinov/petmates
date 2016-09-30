import { User } from './user.model';
import { localISO } from '../providers/common.service';
import LatLng = L.LatLng;

export class Event {
    _id: string;
    creator: string;
    name: string;
    description: string;
    date: string = localISO();
    address: string;
    location: {
        coordinates: Array<number> // [lon, lat]
    };
    participants: Array<User> = [];

    distance: string;
    latLng: LatLng;

    constructor(data?: any) {
        if (data) {
            Object.assign(this, data);
            this.latLng = L.latLng(this.location.coordinates[1], this.location.coordinates[0]);
        }
    }

    setCoords(coords: Array<number>) {
        this.location = {
            coordinates: coords
        };
    }

    /**
     * @param dis distance in meters
     */
    setDistance(dis: number) {
        if (dis) {
            this.distance = dis < 1000 ?
            dis.toFixed().toString() + ' m' :
            (dis / 1000).toFixed(1).toString() + ' km';
        }
    }
}
