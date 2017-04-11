const users = new Map()

function onSocketAuthenticated(socket, uid) {
    users.set(uid, {
        socket,
        lastActive: Date.now()
    })

    // todo 1 send my friends last activities
    // todo 2 send my last activity to my friends
    // todo 3 get last activities in a setTimeout

    socket.on('SOCKET_LAST_ACTIVITIES_REQ', lastActivitiesReq)
    socket.on('disconnect', onDisconnect)

    function lastActivitiesReq(ids) {
        const payload = Object.create(null)

        if (ids && ids.length) {
            ids.forEach(id => {
                if (users.has(id))
                    payload[id] = users.get(id).lastActive
            })
        }

        if (Object.keys(payload).length)
            socket.emit('action', {
                type: 'SOCKET_LAST_ACTIVITIES_SUCCESS',
                payload
            })
    }

    function onDisconnect() {
        // todo clear timer
    }
}

module.exports = {
    users,
    onSocketAuthenticated
}
