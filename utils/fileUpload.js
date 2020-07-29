const mongoose = require('mongoose');
const multer = require('multer');
const Project = require('../models/project');
const GridFsBucket = require('mongodb').GridFSBucket;
const ReadableStream = require('stream').Readable;
const path = require('path');
const mime = require('mime-types')

const storage = multer.memoryStorage();
/*const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});*/

const fileFilter = function(req, file, cb) {
    if (req.fileTypes && req.fileTypes.find((fileType) => file.originalname.endsWith('.' + fileType))) {
        cb(null, file.size <= 50 * 1024 * 1024); // Size no more than 50MB
    } else {
        cb(null, false);
    }
}

const upload = multer({ storage, fileFilter }).array('files');

const uploadFiles = async function(req, res, next) {
    req.fileTypes = await Project.getAllowedFileTypes(req.params.projectId, req.user._id);
    upload(req, res, next);
}

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