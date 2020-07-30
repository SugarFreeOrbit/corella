const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Types.ObjectId;
const multer = require('multer');
const Config = require('../models/config');
const GridFsBucket = require('mongodb').GridFSBucket;
const fs = require('fs');

const fileSchema = new Schema({
    filename: String,
    length: Number
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../tmp')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

function fileFilter(req, file, cb) {
    cb(null, !!(req.fileTypes && req.fileTypes.find((fileType) => file.originalname.endsWith('.' + fileType))));
}

const upload = multer({
    dest: '../tmp',
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    storage,
    fileFilter
}).array('files');

fileSchema.statics.uploadFiles = async function(req, res, next) {
    req.fileTypes = (await Config.findOne()).allowedFileTypes;
    upload(req, res, next);
}

fileSchema.statics.uploadToGridFS = function(file) {
    return new Promise((resolve, reject) => {
        try {
            let bucket = new GridFsBucket(mongoose.connection.db, {
                bucketName: 'attachments'
            });
            let uploadStream = bucket.openUploadStream(file.originalname, {contentType: file.mimetype});
            fs.createReadStream(file.path).pipe(uploadStream);
            uploadStream.on('finish', () => {
                logger.info(`Upload file: ${file.originalname}`);
                fs.unlink(file.path, (err) => err && logger.error(err));
                resolve(ObjectId(uploadStream.id));
            });
        } catch (e) {
            reject(e);
        }
    })
}

fileSchema.statics.downloadById = function(fileId) {
    let bucket = new GridFsBucket(mongoose.connection.db, {
        bucketName: 'attachments'
    });
    return bucket.openDownloadStream(fileId);
}

fileSchema.statics.deleteById = function (fileId) {
    let bucket = new GridFsBucket(mongoose.connection.db, {
        bucketName: 'attachments'
    });
    return bucket.delete(fileId);
}

const File = mongoose.model('File', fileSchema, 'attachments.files');

module.exports = File;