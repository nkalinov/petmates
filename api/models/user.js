var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
var helpers = require('../helpers');
var autopopulate = require('mongoose-autopopulate');
var Friendship = require('./friendship');

// set up a mongoose model
var UserSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    picture: String,
    pets: [{
        name: String,
        sex: String,
        birthday: Date,
        breed: {
            type: Schema.Types.ObjectId,
            ref: 'Breed',
            autopopulate: true
        },
        picture: String
    }],
    mates: [Friendship.Schema],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.plugin(autopopulate);

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    }
    else {
        return next();
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
    var find = this.mates.find((m) => {
        return m.friend._id ? m.friend._id.equals(uid) : m.friend.equals(uid);
    });
    if (find) {
        // no action if already accepted OR requested
        if (find.status === Friendship.Status.ACCEPTED || find.status === Friendship.Status.REQUESTED)
            return cb(null, null);

        // accept other's 'requested'
        this.model('User').findOneAndUpdate({
            _id: uid,
            'mates': {$elemMatch: {friend: this._id}}
        }, {
            $set: {
                'mates.$.status': Friendship.Status.ACCEPTED,
                'mates.$.added': Date.now()
            }
        }, {new: true}).exec().then((friendUpdated) => {
            // accept my 'pending' request
            var myRequest = this.mates.id(find._id);
            myRequest.status = Friendship.Status.ACCEPTED;
            myRequest.added = Date.now();
            this.save().then(() => {
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
        }, {new: true}).exec().then((friendUpdated) => {
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
                    this.model('User').findOneAndUpdate({_id: uid}, {
                        $pull: {
                            'mates': {'mate.friend': this._id}
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