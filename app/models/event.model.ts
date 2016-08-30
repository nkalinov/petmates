import { User } from './user.model';

export class Event {
    _id: string;
    creator: any;
    name: string;
    description: string;
    date: Date;
    address: string;
    location: {
        coordinates: Array<Number> // [lon, lat]
    };
    participants: Array<User> = [];

    distance: string;

    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }

    /**
     * @param dis distance in meters
     */
    setDistance(dis: number) {
        if (dis) {
            this.distance = dis < 1000 ?
            dis.toFixed(3).toString() + ' m' :
            (dis / 1000).toFixed(1).toString() + ' km';
        }
    }
}
