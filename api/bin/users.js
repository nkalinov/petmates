const users = new Map();

function onSocketAuthenticated(socket) {
    const uid = socket.decoded_token._id;

    users.set(uid, {
        socket,
        lastActive: Date.now()
    });

    socket.on('online:get', onOnlineGet);
    socket.on('mate:', onMateEvent);

    /**
     * Get last activities of ids[]
     * @param ids[]
     */
    function onOnlineGet(ids) {
        const lastActivities = {};

        if (ids && ids.length) {
            ids.forEach(id => {
                if (users.has(id)) {
                    lastActivities[id] = users.get(id).lastActive;
                }
            });
        }

        socket.emit('online', lastActivities);
    }

    /**
     * Mate request status change
     * @param action
     * @param data
     */
    function onMateEvent(action, data) {
        const fid = data.myRequest.friend._id;
        if (users.has(fid)) {
            users.get(fid).socket.emit('mate:', action, data);
        }
    }
}

module.exports = {
    users,
    onSocketAuthenticated
};
