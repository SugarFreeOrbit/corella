const multer = require('multer');
const storage = multer.memoryStorage();
const Project = require('../models/project');
const GridFsBucket = require('mongodb').GridFSBucket;
const ReadableStream = require('stream').Readable;
const path = require('path');
const mime = require('mime-types')

const fileFilter = function(req, file, cb) {
	cb(null, req.fileTypes && req.fileTypes.find((fileType) => file.filename.endsWith('.' + fileType)) != null);
}

const upload = multer({ storage, fileFilter }).array('files');

const getAllowedFilesTypes = async function(req, res, next) {
    req.fileTypes = await Project.getAllowedFileTypes(req.params.projectId, req.user._id);
    next();
}

const fileUpload = function(file, callback) {
    let bucket = new GridFsBucket(mongoose.connection.db, {
        bucketName: 'attachments'
    });
    let readableStream = new ReadableStream();
    readableStream.push(file.buffer);
    readableStream.push(null);
    let uploadStream = bucket.openUploadStream(file.filename, {contentType: mime.lookup(file.filename)});
    readableStream.pipe(uploadStream);
    uploadStream.on('finish', () => callback(uploadStream.id));
}

module.exports = {
    upload, getAllowedFilesTypes, fileUpload
}