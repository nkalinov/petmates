import { Pet } from './pet.model';
import { Friendship } from './friendship.interface.ts';

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export class User {
    _id: string;
    name: string;
    email: string;
    password: string;
    pic: string; // filename with url
    pets: Array<Pet>;
    mates: Array<Friendship>;
    city: string;
    country: string;
    location: {
        coordinates: Array<Number> // [lon, lat]
    };

    lastActive: Date = null;
    distance: string;

    constructor(data?, myCoordinates?) {
        if (data) {
            Object.assign(this, data);

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
                const distance = R * c;
                if (distance < 1) {
                    // m
                    this.distance = (distance.toFixed(3) * 1000).toString() + 'm.';
                } else {
                    // km
                    this.distance = distance.toFixed().toString() + 'km.';
                }
            }
        }
    }
}
