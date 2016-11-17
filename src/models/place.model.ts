export enum PlaceType {
    vet,
    shop,
    bar,
    park,
    restaurant,
    hotel,
    school
}

export const placeTypes = [
    PlaceType[PlaceType.vet],
    PlaceType[PlaceType.shop],
    PlaceType[PlaceType.bar],
    PlaceType[PlaceType.park],
    PlaceType[PlaceType.restaurant],
    PlaceType[PlaceType.hotel],
    PlaceType[PlaceType.school],
].map(value => ({
    label: value.charAt(0).toUpperCase() + value.slice(1),
    value
}));

export class Place {
    readonly _id: string;
    readonly creator: string;

    name: string;
    type: string[] = [];
    location: {
        coordinates: Array<number> // [lon, lat]
    };
    address: string;
    pic: string;
    picture: string;
    phone: string;
    hours: string;
    link: string;

    readonly approved: boolean;
    distance: string;

    constructor(data?) {
        if (data) {
            Object.assign(this, data);

            if (data.distance) {
                this.setDistance(data.distance);
            }
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
