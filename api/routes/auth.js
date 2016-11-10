const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const auth = require('../config/auth');
const email = require('../config/email');
const helpers = require('../helpers');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const passport = require('passport');

// send Facebook users an endless local JWT token
// todo get profile info
router.get('/facebook',
    passport.authenticate('facebook-token', { session: false }),
    (req, res) => {
        const token = jwt.sign({ _id: req.user._id }, auth.Jwt.secretOrKey);

        // return the information including token as JSON
        return res.json({
            success: true,
            data: {
                token: 'JWT ' + token,
                profile: req.user
            }
        });
    }
);

// login by email
router.post('/', (req, res) => {
    User.findOne(
        { email: req.body.email.toString().toLowerCase().trim() },
        (err, profile) => {
            if (err)
                return res.json({ success: false, msg: err });

            if (!profile)
                return res.json({ success: false, msg: 'Wrong email or password' });

            // check if password matches
            profile.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.sign({
                        _id: profile._id
                    }, auth.Jwt.secretOrKey);

                    // return the information including token as JSON
                    return res.json({
                        success: true,
                        data: {
                            token: 'JWT ' + token,
                            profile
                        }
                    });
                }

                return res.json({ success: false, msg: 'Wrong email or password' });
            });
        });
});

// create
router.post('/signup', (req, res) => {
    const { name, email, location: { coordinates }, password, picture, city, region, country } = req.body;

    var user = new User({
        name,
        password,
        email,
        city,
        region,
        country,
        picture,
        location: {
            coordinates
        }
    });

    user.save(err => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

// reset password request
router.post('/forgot', (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user)
                    return res.json({ success: false, msg: 'No account with that email address exists.' });

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var nodemailerMailgun = nodemailer.createTransport(mg(email.mailgun));

            var mailOptions = {
                to: user.email,
                from: email.from,
                subject: 'PetMates Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your PetMates account.\n\n' +
                'Please paste the following token into the app forgot password section to complete the process:\n\n' +
                'Reset password token: ' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            nodemailerMailgun.sendMail(mailOptions, function (err) {
                res.json({
                    success: true,
                    msg: 'An e-mail has been sent to ' + user.email + ' with the reset token.'
                });
                done(err, 'done');
            });
        }
    ], (err) => err ? next(err) : '');
});

// check reset token
router.get('/reset/:token', function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user) {
            return res.json({ success: false, msg: 'Password reset token is invalid or has expired.' });
        }
        res.json({ success: true });
    });
});

// change password
router.post('/reset/:token', function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user) {
            return res.json({ success: false, msg: 'Password reset token is invalid or has expired.' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(err => {
            if (err)
                return res.json({ success: false, msg: err });

            return res.json({ success: true, msg: 'Your password has been changed.', data: { name: user.email } });
        });
    });
});

module.exports = router;