const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const helpers = require('../helpers');

const PlaceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['vet', 'shop']
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    city: String,
    country: String,
    picture: String,
    phone: String,
    hours: String,
    link: String
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

PlaceSchema.index({location: '2dsphere'});

PlaceSchema.virtual('pic').get(function () {
    return helpers.uploadPath(this.picture);
});

module.exports = mongoose.model('Place', PlaceSchema);