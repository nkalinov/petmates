var express = require('express');
var router = express.Router();
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../config/database');
var upload = require('../config/upload');
var email = require('../config/email');
var helpers = require('../helpers');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

// login
router.post('/', function (req, res) {
    User.findOne({$or: [{name: req.body.name}, {email: req.body.name}]}, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.sign({_id: user._id}, config.secret);

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        data: {
                            token: 'JWT ' + token,
                            profile: user
                        }
                    });
                } else {
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
});

// create
router.post('/signup', function (req, res) {
    if (!req.body.name || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password,
            email: req.body.email
        });
        // save the user
        newUser.save(function (err) {
            if (err) {
                return res.json({success: false, msg: err});
            }
            res.json({success: true});
        });
    }
});

// reset password request
router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({email: req.body.email}, function (err, user) {
                if (!user) {
                    return res.json({success: false, msg: 'No account with that email address exists.'});
                }
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
    ], function (err) {
        if (err) return next(err);
    });
});

// check reset token
router.get('/reset/:token', function (req, res) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user) {
        if (!user) {
            return res.json({success: false, msg: 'Password reset token is invalid or has expired.'});
        }
        res.json({success: true});
    });
});

// change password
router.post('/reset/:token', function (req, res) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user) {
        if (!user) {
            return res.json({success: false, msg: 'Password reset token is invalid or has expired.'});
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function (err) {
            return res.json({success: true, msg: 'Your password has been changed.', data: {name: user.name}});
        });
    });
});

module.exports = router;