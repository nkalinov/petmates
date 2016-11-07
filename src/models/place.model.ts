export enum PlaceType {
    Vet,
    Shop,
    Bar,
    Park,
    Restaurant,
    Hotel,
    School
}

export class Place {
    readonly _id: string;
    readonly creator: string;

    name: string;
    type: Array<PlaceType> = [];
    location: {
        coordinates: Array<number> // [lon, lat]
    };
    address: string;
    pic: string;
    phone: string;
    hours: string;
    link: string;

    readonly approved: boolean;
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
