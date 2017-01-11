const config = require('../config/auth'),
    walks = require('./walks'),
    users = require('./users'),
    chat = require('./chat'),
    SocketIoJwt = require('socketio-jwt');

module.exports = (server) => {
    const io = require('socket.io')(server, { serveClient: false });

    // set authorization for socket.io
    io.sockets
        .on('connection', SocketIoJwt.authorize({
            secret: config.Jwt.secretOrKey,
            timeout: 15000 // 15 seconds to send the authentication message
        }))
        .on('authenticated', (socket) => {
            // socket is authenticated, we are good to handle more events from it
            users.onSocketAuthenticated(socket);
            chat.onSocketAuthenticated(socket);
            walks.onSocketAuthenticated(socket);
        });
};
