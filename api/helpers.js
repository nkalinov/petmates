var upload = require('./config/upload');

exports.uploadPath = function (src) {
    if (src) {
        return upload.uploads + src;
    } else {
        return null;
    }
};

// todo move to UserSchema.method.toString()
exports.parseUser = function (user) {
    var obj = JSON.parse(JSON.stringify(user));
    if (obj) {
        // parse user picture
        obj.pic = exports.uploadPath(user.picture);
        delete obj.picture;

        // remove password from response
        delete obj.password;

        // parse pets pics
        if (obj.pets && obj.pets.length > 0) {
            obj.pets.forEach(function (pet) {
                pet.pic = exports.uploadPath(pet.picture);
                delete pet.picture;
            });
        }

        // parse mates pics
        if (obj.mates && obj.mates.length > 0) {
            obj.mates.forEach((mate) => {
                if(mate.friend) {
                    var friend = mate.friend;
                    friend.pic = exports.uploadPath(friend.picture);
                    delete friend.picture;

                    // parse mates pets pics
                    if (friend.pets && friend.pets.length > 0) {
                        friend.pets.forEach(function (pet) {
                            pet.pic = exports.uploadPath(pet.picture);
                            delete pet.picture;
                        });
                    }
                }
            });
        }
    }
    return obj;
};