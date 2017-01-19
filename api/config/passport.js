const PassportJwt = require('passport-jwt');
const FacebookTokenStrategy = require('passport-facebook-token');
const User = require('../models/schema/user');
const auth = require('./auth');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const email = require('../config/email');

module.exports = passport => {

    passport.use(new PassportJwt.Strategy(
        auth.Jwt,
        (jwt_payload, cb) => {
            User.findById(jwt_payload._id, function (err, user) {
                if (err)
                    return cb(err, false);

                if (user)
                    return cb(null, user);

                cb(null, false);
            });
        })
    );

    passport.use(new FacebookTokenStrategy(
        auth.Facebook,
        (accessToken, refreshToken, profile, cb) => {

            const fbUser = {
                email: profile.emails[0].value,
                name: profile.name.givenName + ' ' + profile.name.familyName,
                username: profile.username,
                id: profile.id,
                token: accessToken,
                photo: profile.photos ? profile.photos[0].value : null
            };

            // You can perform any necessary actions with your user at this point,
            // e.g. internal verification against a users table,
            // creating new user entries, etc.

            User.findOne({
                $or: [
                    { facebookId: fbUser.id },
                    { email: fbUser.email }
                ]
            }, (err, user) => {
                if (err) {
                    return cb(err, false);
                }
                if (user) {
                    // update profile info
                    user.facebookId = fbUser.id;

                    if (fbUser.photo && user.picture !== fbUser.photo) {
                        user.picture = fbUser.photo;
                    }
                    if (fbUser.email && user.email !== fbUser.email) {
                        user.email = fbUser.email;
                    }

                    if (user.isModified()) {
                        user.save();
                    }

                    return cb(null, user);
                } else {

                    // create user from fb info
                    const newUser = new User({
                        facebookId: fbUser.id,
                        email: fbUser.email,
                        name: fbUser.username || profile.displayName || profile.name.givenName + profile.name.familyName,
                        password: 'PetMates',
                        picture: fbUser.photo
                    });

                    // save the user
                    newUser.save((err, createdUser) => {
                        if (err) {
                            return cb(err, false);
                        }
                        return cb(null, createdUser);
                    });

                    // send a confirmation email with the password
                    var nodemailerMailgun = nodemailer.createTransport(mg(email.mailgun));

                    var mailOptions = {
                        to: fbUser.email,
                        from: email.from,
                        subject: 'Your account on PET MATES',
                        text: 'Welcome to PetMates - your dog\'s favourite app!\n\n' +
                        'As you logged in via Facebook, we generated a password for you, so you can also login with your email.\n\n' +
                        'Password: <strong>PetMates</strong> (case sensitive)\n\n' +
                        'You can always change this from your account\'s settings page or just continue to log with Facebook without a password.\n'
                    };
                    nodemailerMailgun.sendMail(mailOptions, function (err) {
                    });
                }
            });
        })
    );

};
