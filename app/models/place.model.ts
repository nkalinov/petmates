export class Place {
    _id: string;
    name: string;
    type: string;
    location: {
        coordinates: Array<Number> // [lon, lat]
    };
    address: string;
    pic: string;
    phone: string;
    hours: string;
    link: string;

    distance: string;
    timeToDistance: string;

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
            const timeToDistance = (dis / 6) * 60;
            if (timeToDistance < 1) {
                this.timeToDistance = '1min.';
            } else if (timeToDistance > 60) {
                this.timeToDistance = (timeToDistance / 60).toFixed(3).toString() + ' h';
            } else {
                this.timeToDistance = timeToDistance.toFixed().toString() + ' min';
            }

            this.distance = dis < 1000 ?
            dis.toFixed(3).toString() + ' m' :
            (dis / 1000).toFixed(1).toString() + ' km';
        }
    }
}
