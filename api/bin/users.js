const users = new Map()

function onSocketAuthenticated(socket, uid) {
    users.set(uid, {
        socket,
        lastActive: Date.now()
    })

    socket.on('SOCKET_LAST_ACTIVITIES_REQ', lastActivitiesReq)

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
}

module.exports = {
    users,
    onSocketAuthenticated
}
