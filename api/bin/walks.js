const walks = new Map(), // full walks model by region
    moved = new Map(), // walks by region which positions are not yet broadcasted
    Walk = require('../models/Walk')

function onSocketAuthenticated(socket, region) {
    let walk;

    // todo leave when region changed
    socket.join(region)

    socket.on('walks:get', onWalksGet)
    socket.on('walks:start', onWalkStart)
    socket.on('walks:move', onWalkMove)
    socket.on('walks:stop', onWalkStop)
    socket.on('disconnect', onWalkStop)

    function onWalksGet() {
        const regionWalks = walks.get(region);

        // if not alone
        if (regionWalks && regionWalks.size > 1)
            socket.emit('walks:get', [...regionWalks].map(item => item[1]))
    }

    function onWalkStart(data) {
        walk = new Walk(data)

        if (!walks.has(region))
            walks.set(region, new Map())

        walks.get(region).set(walk.id, walk)
        socket.broadcast.to(region).emit('walks:start', walk)
    }

    // emitting the moved walks is handled in cron\walks.js
    function onWalkMove(coords) {
        walk.move(coords);

        if (!moved.has(region))
            moved.set(region, new Map())

        moved.get(region).set(walk.id, coords)
    }

    function onWalkStop() {
        if (walk) {
            socket.broadcast.to(region).emit('walks:stop', walk.id)
            walks.get(region).delete(walk.id)

            const movedRegion = moved.get(region)
            if (movedRegion)
                movedRegion.delete(walk.id)
        }
    }
}

module.exports = {
    onSocketAuthenticated,
    moved
}
