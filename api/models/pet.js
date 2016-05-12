var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autopopulate = require('mongoose-autopopulate');
var helpers = require('../helpers');

var Pet = new Schema({
    name: String,
    sex: String,
    birthday: Date,
    breed: {
        type: Schema.Types.ObjectId,
        ref: 'Breed',
        autopopulate: true
    },
    picture: String
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

Pet.virtual('pic').get(function () {
    return helpers.uploadPath(this.picture);
});

Pet.plugin(autopopulate);

module.exports = Pet;
