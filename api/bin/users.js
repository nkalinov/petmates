// hold users by _id
const users = {};

function onSocketAuthenticated(socket) {
    const uid = socket.decoded_token._id;

    users[uid] = {
        socket: socket,
        lastActive: Date.now()
    };

    socket.on('online:get', onOnlineGet);
    socket.on('mate:', onMateEvent);

    /**
     * Get last activities of ids[]
     * @param ids
     */
    function onOnlineGet(ids) {
        const lastActivities = {};

        if (ids && ids.length) {
            ids.forEach(id => {
                if (users[id]) {
                    lastActivities[id] = users[id].lastActive;
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
        if (users[data.myRequest.friend._id]) {
            users[data.myRequest.friend._id].socket.emit('mate:', action, data);
        }
    }
}

module.exports = {
    users,
    onSocketAuthenticated
};
