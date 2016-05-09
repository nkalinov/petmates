var multer = require('multer');
var paths = {
    public: 'public/',
    uploads: 'uploads/',
    tmp: 'public/tmp/'
};

var single = multer({
    dest: paths.tmp,
    fileFilter: function (req, file, cb) {
        // The function should call `cb` with a boolean
        // to indicate if the file should be accepted

        if (['image/jpeg', 'image/png', 'image/gif', 'image/tiff'].indexOf(file.mimetype) === -1) {
            // To reject this file pass `false`, like so:
            cb(null, false);
        } else {
            // To accept the file pass `true`, like so:
            cb(null, true);
        }

        // You can always pass an error if something goes wrong:
        // cb(new Error('I don\'t have a clue!'));

        // ["jpg", "jpeg", "png", "gif", "tiff"],
    }
}).single('picture');

module.exports = {
    single: single,
    dest: paths.public + paths.uploads,
    uploads: 'http://127.0.0.1:3001/' + paths.uploads // API public link
    // uploads: 'http://192.168.0.104:3001/' + paths.uploads // API public link
};