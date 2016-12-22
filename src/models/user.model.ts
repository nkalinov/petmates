import { Pet } from './pet.model';
import { IFriendship } from './IFriendship';
import { pick } from 'lodash';

const deg2rad = (deg) => deg * (Math.PI / 180);

export class User {
    readonly _id: string;
    name: string;
    email: string;
    password: string;
    picture: string; // filename
    pic: string; // picture url
    pets: Array<Pet> = [];
    mates: Array<IFriendship> = [];
    city: string = '';
    region: string = '';
    country: string = '';
    location: {
        coordinates: Array<number> // [lon, lat]
    } = {
        coordinates: undefined
    };

    lastActive: Date = null;
    distance: string;

    constructor(data?, myCoordinates?) {
        if (data) {
            Object.assign(this, data);

            if (data.distance) {
                this.setDistance(data.distance);
            }

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

    toPartial() {
        return <PartialUser>pick(this, ['_id ', 'name', 'pic']);
    }
}

export interface PartialUser {
    readonly _id: string;
    name: string;
    pic: string;
}
