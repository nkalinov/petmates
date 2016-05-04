var fs = require('fs');
var mongoose = require('mongoose');
var Breed = require('../models/breed');

module.exports = {
    secret: '05da9d7d21aa63c31bd70ad8819f9c9626bf9952',
    init: init
};

// init database
function init() {
    // connect db
    mongoose.connect('mongodb://127.0.0.1/pm2', function (err) {
        if (err) throw err;
        checkBreeds();
    });
}

// check for new breeds
// TODO insert only new OR updated entries
function checkBreeds() {
    Breed.find({}, function (err, dbBreeds) {
        if (err) throw err;

        if (!dbBreeds || dbBreeds.length === 0) {
            fs.readFile('breeds.json', 'utf8', function (err, jsonBreeds) {
                if (err) throw err;
                jsonBreeds = JSON.parse(jsonBreeds);

                var toImport = [];
                for (var i = 0; i < jsonBreeds.length; i++) {
                    toImport.push({
                        name: jsonBreeds[i]
                    });
                }
                // populate DB
                Breed.collection.insertMany(toImport);
            });
        }
    });
}