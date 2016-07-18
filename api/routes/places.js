var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var helpers = require('../helpers');

router.get('/', passport.authenticate('jwt', { session: false }), function (req, res) {
    return res.json({
        success: true,
        data: {
            vets: [
                {
                    name: 'Central VET Clinic',
                    coords: [],
                    phone: '+359 897 599 991',
                    hours: 'Mon-Fri / 9:00-20:00'
                }
            ],
            shops: []
        }
    });
});