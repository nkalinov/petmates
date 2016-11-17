const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const helpers = require('../helpers');

const PlaceSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    type: [
        {
            type: String,
            required: true,
            enum: ['vet', 'shop', 'bar', 'park', 'restaurant', 'hotel', 'school']
        }
    ],
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    address: {
        type: String,
        required: true
    },
    picture: String,
    phone: String,
    hours: String,
    link: String,
    approved: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            delete ret.id;
            delete ret.picture;
            return ret;
        }
    }
});

PlaceSchema.index({ location: '2dsphere' });

PlaceSchema.virtual('pic').get(function () {
    return helpers.uploadPath(this.picture);
});

module.exports = mongoose.model('Place', PlaceSchema);
