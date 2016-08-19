var upload = require('./config/upload');

exports.uploadPath = function (src) {
    if (src) {
        if (src.split('://').length > 1) {
            return src;
        }
        return upload.uploads + src;
    } else {
        return null;
    }
};