const config = require('../config/database');
const walk = require('./walk');
const SocketIoJwt = require('socketio-jwt');

var SocketsModule = (function () {
    var io;

    var connections = {
        updated: false,
        export: function () {
            var exported = {};
            for (var key in connections) {
                if (connections.hasOwnProperty(key) && key !== 'export' && key !== 'updated') {
                    exported[key] = connections[key].lastActive;
                }
            }
            return exported;
        }
    };

    return {
        io: io,
        init: init,
        connections: connections
    };

    /**
     * Attach socket.io listener to server
     * @param server
     */
    function init(server) {
        io = require('socket.io')(server, {serveClient: false});

        // set authorization for socket.io
        io.sockets.on('connection', SocketIoJwt.authorize({
            secret: config.secret,
            timeout: 15000 // 15 seconds to send the authentication message
        })).on('authenticated', onSocketAuthenticated);

        // send users last activity every minute
        setInterval(() => {
            if (connections.updated) {
                io.emit('users', connections.export());
                connections.updated = false;
            }
        }, 60 * 1000);

        // send walk updates every 20sec.
        setInterval(() => {
            // todo namespace /bulgaria /usa ...
            io.emit('walks', walk.walks);
        }, 20 * 1000);
    }

    /**
     * Socket is authenticated, we are good to handle more events from it.
     * @param socket
     */
    function onSocketAuthenticated(socket) {
        var token = socket.decoded_token;
        var uid = token._id;
        var currentWalk;

        // add to online users
        connections[uid] = {
            socket: socket,
            lastActive: Date.now()
        };
        connections.updated = true;

        setTimeout(() => {
            // send online users and walks immediately
            socket.emit('users', connections.export());
            socket.emit('walks', walk.walks);
        }, 1000);

        socket.on('chat:send', onChatSend);
        socket.on('mate:', onMateEvent);
        socket.on('walk:start', onWalkStart);
        socket.on('walk:move', onWalkMove);
        socket.on('walk:stop', onWalkStop);
        socket.on('disconnect', onWalkStop); // user disconnected / logged-out

        /**
         * Create new walk and announce it
         * @param data
         */
        function onWalkStart(data) {
            currentWalk = walk.start(data, socket.id);
            // console.log('onWalkStart', currentWalk);
        }

        /**
         * On walk move
         * @param coords
         */
        function onWalkMove(coords) {
            // console.log('onWalkMove', currentWalk);
            currentWalk.coords = coords;
        }

        /**
         * Walk has stopped
         */
        function onWalkStop() {
            if (currentWalk) {
                walk.stop(currentWalk);
                currentWalk = null;
            }
        }

        /**
         * Chat message sent
         * @param data
         * @param conversation
         */
        function onChatSend(data, conversation) {
            // update user last activity
            connections.updated = true;
            connections[uid].lastActive = Date.now();

            // emit to other members
            conversation.members.forEach((m) => {
                if (m._id !== data.author._id) {
                    if (connections[m._id]) {
                        connections[m._id].socket.emit('chat:receive', data, conversation._id);
                    }
                }
            });
        }
    }

    /**
     * Mate request status change
     * @param action
     * @param data
     */
    function onMateEvent(action, data) {
        if (connections[data.myRequest.friend._id]) {
            connections[data.myRequest.friend._id].socket.emit('mate:', action, data);
        }
    }
})();

module.exports = SocketsModule;