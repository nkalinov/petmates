const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autopopulate = require('mongoose-autopopulate');
const helpers = require('../helpers');
const fs = require('fs');
const upload = require('../config/upload');
const Breed = require('./breed');

const Pet = new Schema({
    name: String,
    sex: String,
    birthday: Date,
    breed: {
        type: Schema.Types.ObjectId,
        ref: 'Breed',
        autopopulate: true
    },
    picture: {
        type: String,
        set: function (value) {
            if (this.picture && value !== this.picture) {
                this._oldPicture = this.picture;
            }
            return value;
        }
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

// handle pictures
Pet.pre('save', true, function (next, done) {
    next(); // in parallel ^

    if (this.isModified('picture') || this.isNew) {
        if (this._oldPicture) {
            // delete old one
            fs.unlink(`${upload.dest}${this._oldPicture}`);
        }

        // copy photo from tmp
        fs.rename(
            `${upload.destTmp}${this.picture}`,
            `${upload.dest}${this.picture}`,
            done
        );
    } else {
        return done();
    }
});

Pet.post('remove', model => {
    if (model.picture) {
        fs.unlink(`${upload.dest}${model.picture}`);
    }
});

Pet.virtual('pic').get(function () {
    return helpers.uploadPath(this.picture);
});

Pet.plugin(autopopulate);

module.exports = Pet;
