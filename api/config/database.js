const fs = require('fs');
const mongoose = require('mongoose');
const Breed = require('../models/breed');
const Place = require('../models/place');

// todo use auth.secret
mongoose.connect('mongodb://127.0.0.1/pm2', err => {
    if (err) throw err;
    seed();
});

// Use native promises
mongoose.Promise = global.Promise;

// check for new breeds
// TODO insert only new OR updated entries
function seed() {
    Breed.findOne({}, function (err, res) {
        if (err) throw err;

        if (!res || res.length === 0) {
            fs.readFile('breeds.json', 'utf8', function (err, jsonBreeds) {
                if (err) throw err;
                jsonBreeds = JSON.parse(jsonBreeds);

                const toImport = [];
                for (let i = 0; i < jsonBreeds.length; i++) {
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
        if (err) throw err;

        if (!res || res.length === 0) {
            const toImport = [
                {
                    name: 'Централна Ветеринарна Клиника',
                    type: ['vet'],
                    location: {
                        coordinates: [23.334503, 42.657809]
                    },
                    address: 'ул. Чавдар Мутафов 25Б, Sofia',
                    phone: '02 421 9999',
                    hours: '24/7',
                    link: 'http://centralvetclinic.com/',
                    picture: 'http://centralvetclinic.com/imgs/rpt.jpg',
                    approved: true
                },
                {
                    name: "Солун магазин и вет клиника",
                    type: ['vet', 'shop'],
                    address: "ул. Солун 16, София 1000",
                    phone: "+359 897 599 991",
                    hours: "Mon-Sat / 8-20h",
                    location: {
                        coordinates: [
                            23.294574,
                            42.674557
                        ],
                        type: "Point"
                    }
                }
            ];

            toImport.forEach(p => {
                const place = new Place(p);
                place.save();
            });
        }
    });
}