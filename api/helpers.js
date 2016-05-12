var upload = require('./config/upload');

exports.uploadPath = function (src) {
    if (src) {
        return upload.uploads + src;
    } else {
        return null;
    }
};