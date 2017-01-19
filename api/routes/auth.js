const express = require('express');
const router = express.Router();
const User = require('../models/schema/user');
const jwt = require('jsonwebtoken');
const auth = require('../config/auth');
const emailConfig = require('../config/email');
const helpers = require('../helpers');
const q = require('q');
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
        { email: req.body.email.toLowerCase().trim() },
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
        email: email.toLowerCase(),
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
router.post('/forgot', (req, res) => {
    const email = req.body.email.toLowerCase();

    User.findOne({ email })
        .exec()
        .then(user => {
            if (!user)
                throw 'No account with that email address exists.';

            return q.nfcall(crypto.randomBytes, 20).then(buf => ({
                user,
                token: buf.toString('hex')
            }));
        })
        .then(({ user, token }) => {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            return user.save().then(() => token);
        })
        .then(token => {
            const nodemailerMailgun = nodemailer.createTransport(mg(emailConfig.mailgun)),
                mailOptions = {
                    to: email,
                    from: emailConfig.from,
                    subject: 'PetMates Password Reset Token',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your PetMates account.\n\n' +
                    'Please paste the following token into the app forgot password section to complete the process:\n\n' +
                    'Reset password token: ' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };

            nodemailerMailgun.sendMail(mailOptions, err => {
                if (err)
                    throw err;

                res.json({
                    success: true,
                    msg: `An e-mail has been sent to ${email} with the reset token.`
                });
            });
        })
        .catch(msg => res.json({ success: false, msg }));
});

// check reset token
router.get('/reset/:token', function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user)
            return res.json({ success: false, msg: 'Password reset token is invalid or has expired.' });

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
        if (!user)
            return res.json({ success: false, msg: 'Password reset token is invalid or has expired.' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(err => {
            if (err)
                return res.json({ success: false, msg: err });

            return res.json({ success: true, data: { email: user.email } });
        });
    });
});

module.exports = router;