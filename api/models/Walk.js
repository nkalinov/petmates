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
    constructor(data) {
        Object.assign(this, data)
    }

    move(coords) {
        this.coords = coords
    }
}

module.exports = Walk
