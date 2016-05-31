const JwtStrategy = require('passport-jwt').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const auth = require('./auth');

module.exports = function (passport) {

    passport.use(new JwtStrategy(auth.Jwt, (jwt_payload, cb) => {
        User.findById(jwt_payload._id, function (err, user) {
            if (err) {
                return cb(err, false);
            }
            if (user) {
                return cb(null, user);
            } else {
                cb(null, false);
            }
        });
    }));

    // todo test
    passport.use(new FacebookStrategy(auth.Facebook, (req, accessToken, refreshToken, profile, cb) => {
        console.log(profile);

        User.findOne({
            $or: {
                _id: profile.id,
                email: profile.emails[0].value
            }
        }, function (err, user) {
            if (err) {
                return cb(err, false);
            }
            if (user) {
                // update profile info
                if (profile.photos && user.picture !== profile.photos[0].value) {
                    user.picture = profile.photos[0].value;
                }
                if (user.email !== profile.emails[0].value) {
                    user.email = profile.emails[0].value;
                }
                if (user.isModified()) {
                    user.save();
                }
                return cb(null, user);
            } else {
                // create user from fb info
                var newUser = new User({
                    _id: profile.id, // todo saves ok ?
                    name: profile.username || profile.displayName,
                    password: 'PetMates', // todo random password ?
                    email: profile.emails[0].value,
                    picture: profile.photos[0].value || null
                });
                // save the user
                newUser.save(function (err, createdUser) {
                    if (err) {
                        return cb(err, false);
                    }
                    return cb(null, createdUser);
                });
            }
        });
    }));
};