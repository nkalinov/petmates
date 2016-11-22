const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    helpers = require('../helpers'),
    autopopulate = require('mongoose-autopopulate'),
    Friendship = require('./friendship'),
    Pet = require('./pet'),
    fs = require('fs'),
    upload = require('../config/upload');

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

    if (this.isModified('picture') || this.isNew) {
        if (this._oldPicture) {
            // delete old one
            fs.unlink(`${upload.dest}${this._oldPicture}`);
        }

        // copy photo from tmp
        // todo save as Buffer in the database
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

UserSchema.methods.requestFriend = function (uid, cb) {
    // search for existing request
    var find = this.mates.find(m => m.friend._id ? m.friend._id.equals(uid) : m.friend.equals(uid));

    if (find) {
        // no action if already accepted OR requested
        if (find.status === Friendship.Status.ACCEPTED || find.status === Friendship.Status.REQUESTED)
            return cb('Already added');

        // accept other's 'requested'
        this.model('User').findOneAndUpdate({
            _id: uid,
            mates: {
                $elemMatch: {
                    friend: this._id
                }
            }
        }, {
            $set: {
                'mates.$.status': Friendship.Status.ACCEPTED,
                'mates.$.added': Date.now()
            }
        }, { new: true }, (err, friendUpdated) => {
            var myRequest = this.mates.id(find._id);
            if (err) {
                // delete
                myRequest.remove();
            } else {
                // accept my 'pending' request
                myRequest.status = Friendship.Status.ACCEPTED;
                myRequest.added = Date.now();
            }
            this.save().then(() => {
                if (err)
                    return cb('User deleted');

                cb(null, {
                    myRequest: myRequest,
                    fRequest: friendUpdated.mates.find((r) => r.friend.equals(this._id))
                });
            });
        }, cb);
    } else {
        //////// NEW request
        // add myself to friend's mates
        this.model('User').findByIdAndUpdate(uid, {
            $push: {
                mates: {
                    status: Friendship.Status.PENDING,
                    friend: this._id
                }
            }
        }, { new: true }, (err, friendUpdated) => {
            if (err)
                return cb('User deleted');

            // add new mate
            this.mates.push({
                status: Friendship.Status.REQUESTED,
                friend: uid
            });
            this.save().then(() => {
                cb(null, {
                    myRequest: this.mates[this.mates.length - 1],
                    fRequest: friendUpdated.mates[friendUpdated.mates.length - 1]
                });
            });
        }, cb);
    }
};

UserSchema.methods.removeFriend = function (fid) {
    return new Promise((resolve, reject) => {
        if (fid) {
            var friendship = this.mates.id(fid);
            if (friendship) {
                var uid = friendship.friend._id;

                // remove friendship from MY side
                friendship.remove();
                this.save().then(() => {
                    // remove friendship from OTHER side
                    this.model('User').findOneAndUpdate({ _id: uid }, {
                        $pull: {
                            mates: { friend: this._id }
                        }
                    }).exec().then((friendUpdated) => {
                        resolve({
                            myRequest: friendship,
                            fRequest: friendUpdated.mates.find((r) => r.friend.equals(this._id))
                        });
                    });
                });
            } else {
                reject('You can delete only your own mates');
            }
        } else {
            reject('You can delete only your own mates');
        }
    });
};

module.exports = mongoose.model('User', UserSchema);
