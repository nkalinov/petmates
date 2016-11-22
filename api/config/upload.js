const multer = require('multer'),
    ip = require('ip'),
    Jimp = require('jimp'),
    ipAddress = ip.address(),
    url = `http://${ipAddress}:${(process.env.PORT || '3001')}/uploads/`,
    urlTmp = `http://${ipAddress}:${(process.env.PORT || '3001')}/tmp/`;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/tmp/')
    },
    filename: function (req, file, cb) {
        const split = file.originalname.split('.');
        cb(null, `${Math.random().toString(36).substring(7)}_${Date.now()}.${split[split.length - 1]}`)
    }
});

const single = multer({
    storage,
    fileFilter: function (req, file, cb) {
        // The function should call `cb` with a boolean
        // to indicate if the file should be accepted

        if ([Jimp.MIME_JPEG, Jimp.MIME_PNG, Jimp.MIME_BMP].indexOf(file.mimetype) === -1) {
            // To reject this file pass `false`, like so:
            cb('Unsupported file format', false);
        } else {
            // To accept the file pass `true`, like so:
            cb(null, true);
        }

        // You can always pass an error if something goes wrong:
        // cb(new Error('I don\'t have a clue!'));
    }
}).single('picture');

module.exports = {
    single,
    dest: 'public/uploads/',
    destTmp: 'public/tmp/',
    url,
    urlTmp
};