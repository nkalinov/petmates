const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    helpers = require('../../helpers'),
    autopopulate = require('mongoose-autopopulate'),
    Friendship = require('./friendship'),
    Pet = require('./pet'),
    fs = require('fs'),
    upload = require('../../config/upload');

// set up a mongoose model
const UserSchema = new Schema({
    facebookId: String,
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    city: String,
    region: String,
    country: String,
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
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
    pets: [Pet],
    mates: [Friendship.Schema],
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            delete ret.id;
            delete ret.picture;
            delete ret.password;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpires;
            return ret;
        }
    }
});

UserSchema.index({ location: '2dsphere' });

UserSchema.virtual('pic').get(function () {
    return helpers.uploadPath(this.picture);
});

UserSchema.plugin(autopopulate);

UserSchema.pre('save', true, function (next, done) {
    next(); // in parallel ^

    if (this.isModified('picture') || (this.isNew && this.picture)) {
        if (this._oldPicture) {
            // delete old one
            fs.unlink(`${upload.dest}${this._oldPicture}`);
        }

        // copy photo from tmp
        // todo save as Buffer in the database and delete ?
        fs.rename(
            `${upload.destTmp}${this.picture}`,
            `${upload.dest}${this.picture}`,
            done
        );
    } else {
        return done();
    }
});

UserSchema.pre('save', function (next) {
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err)
                return next(err);

            bcrypt.hash(this.password, salt, (err, hash) => {
                if (err)
                    return next(err);

                this.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// delete pictures
UserSchema.post('remove', model => {
    if (model.picture) {
        fs.unlink(`${upload.dest}${model.picture}`);
    }

    if (model.pets.length > 0) {
        model.pets.forEach(pet => {
            if (pet.picture) {
                fs.unlink(`${upload.dest}${pet.picture}`);
            }
        });
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

UserSchema.methods.requestFriend = function (uid) {
    if (!uid)
        return Promise.reject('You can delete only your own mates');

    // search for existing request
    const myRequest = this.mates.find(m => m.friend._id ? m.friend._id.equals(uid) : m.friend.equals(uid));

    if (myRequest) {
        // no action if already accepted OR requested
        if (myRequest.status === Friendship.Status.ACCEPTED || myRequest.status === Friendship.Status.REQUESTED)
            return Promise.reject('Already added');

        // accept other's 'requested'
        return this.model('User')
            .findOneAndUpdate({
                    _id: uid,
                    mates: {
                        $elemMatch: {
                            friend: this._id
                        }
                    }
                },
                {
                    $set: {
                        'mates.$.status': Friendship.Status.ACCEPTED,
                        'mates.$.added': Date.now()
                    }
                },
                { new: true }
            )
            .exec()
            .then(newData => {
                // accept my 'pending'
                myRequest.status = Friendship.Status.ACCEPTED;
                myRequest.added = Date.now();

                return this.save().then(() => ({
                        myRequest,
                        fRequest: newData.mates.find(r => r.friend.equals(this._id))
                    })
                );
            });
    }

    //////// NEW request
    // add myself to friend's mates (pending)
    return this.model('User')
        .findByIdAndUpdate(uid, {
                $push: {
                    mates: {
                        status: Friendship.Status.PENDING,
                        friend: this._id
                    }
                }
            },
            { new: true }
        )
        .exec()
        .then(newData => {
            // add new mate (requested)
            this.mates.push({
                status: Friendship.Status.REQUESTED,
                friend: uid
            });

            return this.save().then(() => ({
                    myRequest: this.mates[this.mates.length - 1],
                    fRequest: newData.mates[newData.mates.length - 1]
                })
            );
        });
};

UserSchema.methods.removeFriend = function (uid) {
    if (!uid)
        return Promise.reject('You can delete only your own mates');

    const myRequest = this.mates.find(m => m.friend._id ? m.friend._id.equals(uid) : m.friend.equals(uid));

    if (!myRequest)
        return Promise.reject('You can delete only your own mates');

    // remove friendship from MY side
    myRequest.remove();

    return this.save().then(() =>
        // remove friendship from OTHER side
        this.model('User')
            .findOneAndUpdate({ _id: uid }, {
                $pull: {
                    mates: { friend: this._id }
                }
            })
            .exec()
            .then(friendUpdated => ({
                    myRequest,
                    fRequest: friendUpdated.mates.find(r => r.friend.equals(this._id))
                })
            )
    );
};

module.exports = mongoose.model('User', UserSchema);
