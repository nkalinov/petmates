const config = require('../config/auth'),
    walks = require('./walks'),
    users = require('./users'),
    chat = require('./chat'),
    SocketIoJwt = require('socketio-jwt')

module.exports = server => {
    const io = require('socket.io')(server, { serveClient: false })

    io.sockets
        .on('connection', SocketIoJwt.authorize({
            secret: config.Jwt.secretOrKey,
            timeout: 15000 // 15 seconds to send the authentication message
        }))
        .on('authenticated', (socket) => {
            const uid = socket.decoded_token._id,
                region = socket.handshake.query.region

            // socket is authenticated, we are good to handle more events from it
            users.onSocketAuthenticated(socket, uid)
            chat.onSocketAuthenticated(socket, uid)
            walks.onSocketAuthenticated(socket, region)
        })

    return io
}
