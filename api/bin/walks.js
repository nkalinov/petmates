const walks = new Map(),
    users = require('./users').users;

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
        Object.assign(this, data);
        this.socket = socket;
    }

    move(coords) {
        this.coords = coords;
    }
}

// function stop(walk) {
//     if (walk) {
//         var index = walks.indexOf(walk);
//         if (index > -1) {
//             walks.splice(index, 1);
//             return true;
//         }
//     }
//     return false;
// }

function onSocketAuthenticated(socket) {
    let walk;
    const region = socket.handshake.query.region;

    socket.join(region);

    // setTimeout(() => {
    //     socket.emit('walks', walks)
    // }, 1000);

    socket.on('walk:start', onWalkStart);
    socket.on('walk:move', onWalkMove);
    socket.on('walk:stop', onWalkStop);
    socket.on('disconnect', onWalkStop);


    function onWalkStart(data) {
        walk = new Walk(data);
        walksMap.set(walk.id, walk);
        socket.broadcast.to(region).emit('walk:start', walk);
    }

    function onWalkMove(coords) {
        walk.move(coords);
    }

    function onWalkStop() {
        if (walk) {
            stop(walk);
            walk = null;
        }
    }
}

module.exports = {
    onSocketAuthenticated
};
