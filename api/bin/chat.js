const users = require('./users').users;

function onSocketAuthenticated(socket) {
    const uid = socket.decoded_token._id;

    socket.on('chat:msg:send', onChatSend);

    function onChatSend(data, cid) {
        users[uid].lastActive = Date.now();
        socket.broadcast.to(cid).emit('chat:msg:new', data, cid);
    }
}

module.exports = {
    onSocketAuthenticated
};
