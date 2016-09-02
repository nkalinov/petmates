import { Pet } from './pet.model';
import { Friendship } from './friendship.interface.ts';
import LatLng = L.LatLng;

const deg2rad = (deg) => deg * (Math.PI / 180);

export class User {
    _id: string;
    name: string;
    email: string;
    password: string;
    picture: string; // filename
    pic: string; // picture url
    pets: Array<Pet> = [];
    mates: Array<Friendship> = [];
    city: string = '';
    country: string = '';
    location: {
        coordinates: Array<Number> // [lon, lat]
    } = {
        coordinates: undefined
    };

    lastActive: Date = null;
    distance: string;
    latLng: LatLng;

    constructor(data?, myCoordinates?) {
        if (data) {
            Object.assign(this, data);

            this.latLng = L.latLng(this.location.coordinates[1], this.location.coordinates[0]);

            if (myCoordinates && this.location && this.location.coordinates.length > 0) {
                const lat1 = this.location.coordinates[1];
                const lon1 = this.location.coordinates[0];
                const lat2 = myCoordinates[1];
                const lon2 = myCoordinates[0];

                const R = 6371; // Radius of the earth in km
                const dLat = deg2rad(lat2 - lat1);  // deg2rad below
                const dLon = deg2rad(lon2 - lon1);
                const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                    ;
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = (R * c) * 1000;
                this.setDistance(distance);
            }
        }
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
