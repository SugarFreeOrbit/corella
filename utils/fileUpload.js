const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const multer = require('multer');
const Config = require('../models/config');
const GridFsBucket = require('mongodb').GridFSBucket;
const fs = require('fs');

//const storage = multer.memoryStorage();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../tmp')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const fileFilter = function(req, file, cb) {
    if (req.fileTypes && req.fileTypes.find((fileType) => file.originalname.endsWith('.' + fileType))) {
        // cb(null, file.size <= 50 * 1024 * 1024); // Size no more than 50MB
        cb(null, true)
    } else {
        cb(null, false);
    }
}

const upload = multer({ dest: '../tmp', storage, fileFilter }).array('files');

const uploadFilesMiddleware = async function(req, res, next) {
    req.fileTypes = (await Config.findOne()).allowedFileTypes;
    upload(req, res, next);
}

const fileUpload = function(file) {
    return new Promise((resolve, reject) => {
        try {
            let bucket = new GridFsBucket(mongoose.connection.db, {
                bucketName: 'attachments'
            });
            let uploadStream = bucket.openUploadStream(file.originalname, {contentType: file.mimetype});
            fs.createReadStream(file.path).pipe(uploadStream);
            uploadStream.on('finish', () => {
                fs.unlink(file.path, (err) => err && logger.error(err));
                resolve(ObjectId(uploadStream.id));
            });
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    uploadFilesMiddleware, fileUpload
}