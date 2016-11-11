const walks = [];

/**
 *  id?:string;
 *  user?:{
 *      _id:string,
 *      name:string
 *  };
 *  coords?:LatLngExpression;
 *  pet?:{
 *      name:string,
 *      breed:{name:string},
 *      birthday:Date,
 *      pic:string
 *  };
 */
class Walk {
    constructor(data, socket) {
        if (data) {
            Object.assign(this, data);
        }
    }
}


/**
 * Start walk
 * @param data
 * @param socketId
 * @returns Walk
 */
function start(data, socketId) {
    var newLength = walks.push(new Walk(data, socketId));
    return walks[newLength - 1];
}

/**
 * Stop walk
 * @param walk
 * @returns {boolean}
 */
function stop(walk) {
    if (walk) {
        var index = walks.indexOf(walk);
        if (index > -1) {
            walks.splice(index, 1);
            return true;
        }
    }
    return false;
}

function onSocketAuthenticated(socket) {
    const region = socket.handshake.query.region;

    let currentWalk;

    socket.join(region);

    // setTimeout(() => {
    //     socket.emit('walks', walks)
    // }, 1000);

    socket.on('walk:start', onWalkStart);
    socket.on('walk:move', onWalkMove);
    socket.on('walk:stop', onWalkStop);
    socket.on('disconnect', onWalkStop); // user disconnected / logged-out


    function onWalkStart(data) {
        currentWalk = start(data, socket.id);
        socket.broadcast.emit('walk:start', currentWalk);
    }

    function onWalkMove(coords) {
        currentWalk.coords = coords;
    }

    function onWalkStop() {
        if (currentWalk) {
            stop(currentWalk);
            currentWalk = null;
        }
    }
}

module.exports = {
    onSocketAuthenticated
};
