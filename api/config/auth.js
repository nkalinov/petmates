const ip = require('ip');

module.exports = {
    db: '46894d11ef27a7d83c83f2c61605da9d7d21aa63c31bd70ad8819f9c9626b',
    Jwt: {
        secretOrKey: '05da9d7d21aa63c31bd70ad8819f9c9626bf9952',
    },
    Facebook: {
        clientID: '1144937372229433',
        clientSecret: '46894d11ef27a7d83c83f2c61697ab0c',
        callbackURL: 'http://' + ip.address() + ':' + (process.env.PORT || '3001') + '/auth/facebook/callback',
        profileFields: ['id', 'name', 'picture', 'email'],
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    }
};