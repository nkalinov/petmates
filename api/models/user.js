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
    else if (this.isModified('mates')) {
        // populate new mates immediately
        user.populate({
            path: 'mates',
            model: 'User',
            select: '_id name picture pets'
        }, () => {
            user.populate({
                path: 'mates.friend.pets.breed',
                model: 'Breed',
                select: 'name'
            }, () => next());
        });
        return next();
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
        return m.friend._id === uid;
    });
    if (find) {
        // no action if accepted OR requested
        if (find.status === Friendship.Status.ACCEPTED || find.status === Friendship.Status.REQUESTED)
            return cb(null, null);

        // find and update friend's request
        this.model('User').findById(uid, (err, friend) => {
            if (!err && friend) {
                var fRequest = friend.mates.find((m) => {
                    return m.friend === this._id;
                });
                if (fRequest) {
                    fRequest.status = Friendship.Status.ACCEPTED;
                    fRequest.added = Date.now();
                    return friend.save();
                }
            }
            throw new Error('User do not exists');
        }).then(() => {
            // update my requests

            var myRequest = this.mates.id(find._id);
            myRequest.status = Friendship.Status.ACCEPTED;
            myRequest.added = Date.now();
            this.save(cb(null, this.mates[this.mates.length - 1]));

        }, cb);
    } else {
        //////// NEW request
        // add myself to friend's mates
        this.model('User').findById(uid, (err, friend) => {
            if (!err && friend) {
                friend.mates.push({
                    status: Friendship.Status.PENDING,
                    friend: this._id
                });
                return friend.save();
            }
            throw new Error('User do not exists');
        }).then(() => {
            // add new mate
            this.mates.push({
                status: Friendship.Status.REQUESTED,
                friend: uid
            });
            this.save(cb(null, this.mates[this.mates.length - 1]));
        }, cb);
    }
};

UserSchema.methods.removeFriend = function (fid, cb) {
    if (fid) {
        var friendship = this.mates.id(fid);
        var uid = friendship.friend._id;

        // remove friendship from MY side
        friendship.remove();
        this.save().then(() => {
            // remove friendship from OTHER side
            this.model('User').findById(uid, (err, friend) => {
                var fRequest = friend.mates.find((m) => {
                    return m.friend === this._id;
                });
                friend.mates.pull({_id: fRequest._id});
                friend.save(cb);
            });
        }, cb);
    }

    return cb(new Error('You can delete only your own mates'));
};

module.exports = mongoose.model('User', UserSchema);