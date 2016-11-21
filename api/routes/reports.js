const express = require('express');
const router = express.Router();
const Report = require('../models/report');
const fs = require('fs');
const passport = require('passport');

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { type, id, description } = req.body,
        data = {
            reporter: req.user._id,
            type,
            description
        };

    if (type === 'user') {
        data.user = id;
    } else {
        data.place = id;
    }

    const report = new Report(data);
    report.save(err => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    })
});

module.exports = router;