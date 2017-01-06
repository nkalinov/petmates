import { User } from './User';
import { localISO } from '../utils/common';

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

    distance: number;
    latLng: L.LatLng;

    constructor(data?: any) {
        Object.assign(this, data);

        if (data) {
            this.latLng = L.latLng(this.location.coordinates[1], this.location.coordinates[0]);
        }
    }

    setCoords(coords: Array<number>) {
        this.location = {
            coordinates: coords
        };
    }
}
