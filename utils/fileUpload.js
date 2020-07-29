const mongoose = require('mongoose');
const multer = require('multer');
const Project = require('../models/project');
const GridFsBucket = require('mongodb').GridFSBucket;
const ReadableStream = require('stream').Readable;
const path = require('path');
const mime = require('mime-types')

const storage = multer.memoryStorage();

const fileFilter = function(req, file, cb) {
    cb(null, req.fileTypes && req.fileTypes.find((fileType) => file.originalname.endsWith('.' + fileType)) != null);
}

const uploadFiles = multer({ storage, fileFilter }).array('files');

const fileUpload = function(file, callback) {
    let bucket = new GridFsBucket(mongoose.connection.db, {
        bucketName: 'attachments'
    });
    let readableStream = new ReadableStream();
    readableStream.push(file.buffer);
    readableStream.push(null);
    let uploadStream = bucket.openUploadStream(file.originalname, {contentType: mime.lookup(file.originalname)});
    readableStream.pipe(uploadStream);
    uploadStream.on('finish', () => callback(uploadStream.id));
}

module.exports = {
    uploadFiles, fileUpload
}