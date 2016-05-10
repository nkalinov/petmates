var express = require('express');
var router = express.Router();
var User = require('../models/user');
var config = require('../config/database');
var passport = require('passport');
var upload = require('../config/upload');
var fs = require('fs');
var Jimp = require("jimp");
var _ = require('lodash/core');

// Create
router.post('/', passport.authenticate('jwt', {session: false}),
    function (req, res) {
        // add pet
        req.user.pets.push({
            name: req.body.name,
            sex: req.body.sex,
            birthday: req.body.birthday,
            breed: req.body.breed._id
        });

        // save
        req.user.save(function (err, user) {
            if (err)
                return res.json({success: false, msg: err});
            return res.json({success: true, pet: req.user.pets[user.pets.length - 1]});
        });
    });

// Update
router.put('/:id', passport.authenticate('jwt', {session: false}),
    function (req, res) {
        var petId = req.params.id;
        if (petId) {
            User.update(
                {
                    _id: req.user._id,
                    'pets._id': petId
                },
                {
                    '$set': {
                        'pets.$.name': req.body.name,
                        'pets.$.sex': req.body.sex,
                        'pets.$.birthday': req.body.birthday,
                        'pets.$.breed': req.body.breed._id
                    }
                },
                function (err, updated) {
                    // updated ---> https://docs.mongodb.org/manual/reference/command/update/#output
                    if (err) throw err;
                    if (updated.n === 0) {
                        return res.json({success: false, msg: 'You can update only your own pets'});
                    }
                    return res.json({success: true});
                });
        } else {
            return res.json({success: false, msg: 'You can update only your own pets'});
        }
    });

// Delete
router.delete('/:id', passport.authenticate('jwt', {session: false}),
    function (req, res) {
        var id = req.params.id;
        if (id) {
            // pull pet
            var pullPet = function () {
                req.user.pets.pull({_id: id});
                req.user.save(function (err) {
                    if (err) throw err;
                    return res.json({success: true});
                });
            };
            // remove pet id from user's pets
            var find = _.find(req.user.pets, function (el) {
                return el._id == id
            });
            if (find) {
                if (find.picture) {
                    // delete photo first
                    fs.unlink(upload.dest + find.picture, pullPet);
                } else {
                    pullPet();
                }
            } else {
                return res.json({success: false, msg: 'You can delete only your own pets'});
            }
        } else {
            return res.json({success: false, msg: 'You can delete only your own pets'});
        }
    });

// upload picture
router.post('/:id/upload',
    passport.authenticate('jwt', {session: false}),
    function (req, res) {
        var petId = req.params.id;
        if (petId) {
            // check if owner before upload
            var owner = false;
            var oldPicture;
            for (var i = 0; i < req.user.pets.length; i++) {
                if (req.user.pets[i]['_id'] == petId) {
                    owner = true;
                    oldPicture = req.user.pets[i]['picture'];
                    break;
                }
            }
            if (owner) {
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
                            fs.rename(file.destination + file.filename, upload.dest + file.finalname,
                                function (err) {
                                    if (err) {
                                        // delete temporary file
                                        fs.unlink(file.destination + file.filename);
                                        res.json({success: false, msg: err});
                                    } else {
                                        // delete old profile picture (if one)
                                        if (oldPicture) {
                                            fs.unlink(upload.dest + oldPicture, function (err) {
                                                // do not throw error
                                            });
                                        }
                                        // save the new picture in DB
                                        User.update(
                                            {
                                                _id: req.user._id,
                                                'pets._id': petId
                                            },
                                            {
                                                '$set': {
                                                    'pets.$.picture': file.finalname
                                                }
                                            },
                                            function (err, updated) {
                                                // updated ---> https://docs.mongodb.org/manual/reference/command/update/#output
                                                if (err || updated.n === 0) {
                                                    // delete
                                                    fs.unlink(upload.dest + file.finalname);
                                                    return res.json({
                                                        success: false,
                                                        msg: 'You can update only your own pets'
                                                    });
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
            } else {
                return res.json({success: false, msg: 'You can update only your own pets'});
            }
        } else {
            return res.json({success: false, msg: 'You can update only your own pets'});
        }
    });

module.exports = router;