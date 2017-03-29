const users = new Map()

function onSocketAuthenticated(socket, uid) {
    users.set(uid, {
        socket,
        lastActive: Date.now()
    })

    // todo 1 send my friends last activities
    // todo 2 send my last activity to my friends

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
