const fs = require('fs');
const mongoose = require('mongoose');
const Breed = require('../models/breed');
const Place = require('../models/place');

module.exports = () => {
    // todo use auth.secret
    mongoose.connect('mongodb://127.0.0.1/pm2', err => {
        if (err) throw err;
        seed();
    });
};

// check for new breeds
// TODO insert only new OR updated entries
function seed() {
    Breed.findOne({}, function (err, res) {
        if (err) throw err;

        if (!res || res.length === 0) {
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

    Place.findOne({}, (err, res) => {
        if (err)
            throw err;

        if (!res || res.length === 0) {
            const place = new Place({
                name: 'Централна Ветеринарна Клиника',
                type: 'vet',
                location: {
                    coordinates: [23.334503, 42.657809]
                },
                city: 'Sofia',
                country: 'Bulgaria',
                phone: '+359 897 599 991',
                hours: '24/7',
                link: 'http://centralvetclinic.com/'
            });
            place.save();
        }
    });
}