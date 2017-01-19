const users = require('./users').users;

function onSocketAuthenticated(socket, uid) {
    socket.on('chat:msg:send', onChatSend);

    function onChatSend(message, cid) {
        users.get(uid).lastActive = Date.now();
        socket.broadcast.to(cid).emit('chat:msg:new', message, cid);
    }
}

module.exports = {
    onSocketAuthenticated
};
