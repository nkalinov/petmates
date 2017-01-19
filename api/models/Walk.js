/**
 *  id: string;
 *  user: {
 *      _id: string,
 *      name: string,
 *      pic: string
 *  };
 *  coords: LatLngExpression;
 *  pet: {
 *      name: string,
 *      breed: {
 *          name: string
 *      },
 *      pic: string
 *  };
 */
class Walk {
    constructor(data, socket) {
        Object.assign(this, data)
        this.socket = socket
    }

    move(coords) {
        this.coords = coords
    }
}

module.exports = Walk
