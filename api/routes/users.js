const express = require('express');
const router = express.Router();
const passport = require('passport');
const upload = require('../config/upload');
const fs = require('fs');
const Jimp = require('jimp');
const User = require('../models/user');

// check token validity and that user exists
router.post('/check', passport.authenticate('jwt', {session: false}), (req, res) => res.json({
    success: true,
    data: req.user
}));

// delete
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    var user = req.user;

    req.user.remove(err => {
        if (err) {
            return res.json({success: false, msg: err});
        }

        // deletion OK, continue in the background...
        res.json({success: true});

        // delete profile picture
        if (user.picture) {
            fs.unlink(upload.dest + user.picture);
        }
        // delete pets pictures
        if (user.pets && user.pets.length) {
            user.pets.forEach((pet) => {
                if (pet.picture) {
                    fs.unlink(upload.dest + pet.picture);
                }
            });
        }
        // remove user from other's mates
        if (user.mates && user.mates.length) {
            User.update({_id: {$in: user.mates.map((m) => m.friend._id)}}, {
                $pull: {
                    mates: {friend: user._id}
                }
            }, {multi: true}).exec();
        }
    });
});

// update
router.put('/', passport.authenticate('jwt', {session: false}), function (req, res) {
    const {name, email, location, password, city, country} = req.body;

    if (name && name !== req.user.name) {
        req.user.name = name;
    }
    if (email && email !== req.user.email) {
        req.user.email = email;
    }
    if (location.coordinates && location.coordinates !== req.user.location.coordinates) {
        req.user.location.coordinates = location.coordinates;
    }
    if (city && city !== req.user.city) {
        req.user.city = city;
    }
    if (country && country !== req.user.country) {
        req.user.country = country;
    }
    if (password) {
        req.user.password = password;
    }

    if (req.user.isModified()) {
        req.user.save(function (err, data) {
            if (err) {
                return res.json({success: false, msg: err.message});
            }
            return res.json({success: true, data});
        });
    } else {
        return res.json({success: true});
    }
});

// upload picture
router.post('/upload', passport.authenticate('jwt', {session: false}), function (req, res) {
    upload.single(req, res, function (err) {
        if (err) {
            res.json({success: false, msg: err});
        }
        // {
        //     "fieldname": "picture",
        //     "originalname": "Nikola_Kalinov.jpg",
        //     "encoding": "7bit",
        //     "mimetype": "image/jpeg",
        //     "destination": "public/tmp/",
        //     "filename": "6c8493e942521a4521fe08243ad695d4",
        //     "path": "public\\uploads\\6c8493e942521a4521fe08243ad695d4",
        //     "size": 71706
        // }
        var file = req.file;

        if (file && file.size !== 0) {
            var ext = file.originalname.split('.');
            if (ext.length === 2) {
                // add extension to filename
                file.finalname = file.filename + '.' + ext[1];

                // rename file with extension and move from tmp/ to uploads/
                fs.rename(file.destination + file.filename, upload.dest + file.finalname, function (err) {
                    if (err) {
                        // delete temporary file
                        fs.unlink(file.destination + file.filename);
                        res.json({success: false, msg: err});
                    } else {
                        // delete old profile picture (if one)
                        if (req.user.picture !== null) {
                            fs.unlink(upload.dest + req.user.picture, function (err) {
                                // do not throw error
                            });
                        }
                        // save the new picture in DB
                        req.user.picture = file.finalname;
                        req.user.save(function (err) {
                            if (err) {
                                // delete
                                fs.unlink(upload.dest + file.finalname);
                                res.json({success: false, msg: err});
                            } else {
                                // resize
                                Jimp.read(upload.dest + file.finalname, function (err, picture) {
                                    if (err) throw err;
                                    if (!err) {
                                        picture
                                        // .resize(Jimp.AUTO, 200)            // resize
                                            .quality(100)                 // set JPEG quality
                                            .write(upload.dest + file.finalname, function () {
                                                // return with src URL
                                                file.url = upload.uploads + file.finalname;
                                                res.json({success: true, file: file});
                                            });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        } else {
            if (file) {
                fs.unlink(file.destination + file.filename);
            }
            res.json({success: false, msg: 'Unsupported file'});
        }
    });
});

// todo upload/tmp (creation pages)

module.exports = router;