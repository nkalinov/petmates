var JwtStrategy = require('passport-jwt').Strategy;
var User = require('../models/user');
var config = require('./database'); // get db config file

module.exports = function (passport) {
    passport.use(new JwtStrategy({
        secretOrKey: config.secret
    }, function (jwt_payload, done) {
        User.findById(jwt_payload._id, function (err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                done(null, false);
            }
        });
    }));
};