const express = require('express');
const router = express.Router();
const passport = require('passport');
const upload = require('../config/upload');
const fs = require('fs');
const Jimp = require('jimp');

router.post('/', (req, res) => {
    upload.single(req, res, err => {
        if (err)
            return res.json({ success: false, msg: err });
        // {
        //     "fieldname": "picture",
        //     "originalname": "Nikola_Kalinov.jpg",
        //     "encoding": "7bit",
        //     "mimetype": "image/jpeg",
        //     "destination": "public/tmp/",
        //     "filename": "picture-1472033528336.jpg",
        //     "path": "public\\tmp\\picture-1472033528336.jpg",
        //     "size": 71706
        // }
        const data = req.file;

        if (data && data.size !== 0) {
            return Jimp.read(data.path).then(image => {
                image
                    .cover(500, 500, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
                    .quality(80)
                    .write(data.path, () => {
                        data.url = `${upload.urlTmp}${data.filename}`;
                        res.json({ success: true, data });
                    });
            }, err => res.json({ success: false, msg: err }));
        }

        res.json({ success: false, msg: 'Unsupported file' });
    });
});

module.exports = router;