export class Place {
    _id: string;
    name: string;
    type: string;
    location: {
        coordinates: Array<number> // [lon, lat]
    };
    address: string;
    pic: string;
    phone: string;
    hours: string;
    link: string;

    distance: string;

    constructor(data?) {
        if (data) {
            Object.assign(this, data);
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
