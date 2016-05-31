const fs = require('fs');
const mongoose = require('mongoose');
const Breed = require('../models/breed');

module.exports = () => {
    // todo use auth.secret
    mongoose.connect('mongodb://127.0.0.1/pm2', function (err) {
        if (err) throw err;
        seed();
    });
};

// check for new breeds
// TODO insert only new OR updated entries
function seed() {
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