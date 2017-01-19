const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const helpers = require('../../helpers');
const fs = require('fs');
const upload = require('../../config/upload');

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
    picture: {
        type: String,
        set: function (value) {
            if (this.picture && value !== this.picture) {
                this._oldPicture = this.picture;
            }
            return value;
        }
    },
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

// replace picture
PlaceSchema.pre('save', true, function (next, done) {
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

// delete pictures
PlaceSchema.post('remove', model => {
    if (model.picture) {
        fs.unlink(`${upload.dest}${model.picture}`);
    }
});

module.exports = mongoose.model('Place', PlaceSchema);
