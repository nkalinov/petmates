const users = require('./users').users;

function onSocketAuthenticated(socket, uid) {
    socket.on('CHAT_SEND_MSG_REQ_SUCCESS', onMsgSend);

    function onMsgSend({ msg, chatId }) {
        users.get(uid).lastActive = Date.now();

        socket
            .to(chatId)
            .emit('action', {
                type: 'SOCKET_CHAT_SEND_MSG_REQ_SUCCESS',
                payload: {
                    msg,
                    chatId
                }
            });
    }
}

module.exports = {
    onSocketAuthenticated
};
