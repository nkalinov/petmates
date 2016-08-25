const ip = require('ip');
const PassportJwt = require('passport-jwt');

module.exports = {
    db: '46894d11ef27a7d83c83f2c61605da9d7d21aa63c31bd70ad8819f9c9626b',
    Jwt: {
        secretOrKey: '05da9d7d21aa63c31bd70ad8819f9c9626bf9952',
        jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeader()
    },
    Facebook: {
        clientID: '1144937372229433',
        clientSecret: '46894d11ef27a7d83c83f2c61697ab0c'
    }
};