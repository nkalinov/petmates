var onlineUsers = []; // online users container

/**
 * User mapper
 * @param data
 * @param socket
 * @constructor
 */
function User(data, socket) {
    this.sockets = [socket];
    this.id = -1;

    if (data !== undefined) {
        this.id = data.id;
    }
}

/**
 * Add user to online users array
 * or add new socket to an existing one
 * @param data
 * @param socketId
 * @returns User
 */
function addOnlineUser(data, socketId) {
    var isOnline = false;
    var user;

    // check if user exists
    onlineUsers.some(function (u, index) {
        if (u.id === data.id) {
            // add new socket
            isOnline = true;
            user = onlineUsers[index];
            user.sockets.push(socketId);
            return true;
        }
    });

    // save
    if (!isOnline) {
        onlineUsers.push(new User(data, socketId));
        user = onlineUsers[onlineUsers.length - 1];
    }

    console.log('online users: ', onlineUsers);
    return user;
}

/**
 * Remove online user's socket
 * @param user
 * @param socketId
 */
function removeOnlineUser(user, socketId) {
    // if last socket
    if (user.sockets.length === 1) {
        onlineUsers.splice(onlineUsers.indexOf(user), 1)
    }
    else {
        // remove only this socket
        user.sockets.splice(user.sockets.indexOf(socketId), 1);
    }
    console.log('online users: ', onlineUsers);
}

/**
 * Find online user by his uid
 * @param id
 * @returns {*}
 */
function findUserById(id) {
    var user;
    for (var i = 0; i < onlineUsers.length; i++) {
        if (onlineUsers[i].id === id) {
            user = onlineUsers[i];
            break;
        }
    }
    return user;
}

module.exports = {
    User: User,
    onlineUsers: onlineUsers,
    addOnlineUser: addOnlineUser,
    removeOnlineUser: removeOnlineUser,
    findUserById: findUserById
};