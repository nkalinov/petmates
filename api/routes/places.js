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
                    name: 'Централна ветеринарна клиника',
                    coords: [42.657809, 23.334503],
                    phone: '+359 897 599 991',
                    hours: 'Mon-Fri / 9:00-20:00'
                }
            ],
            shops: []
        }
    });
});

module.exports = router;