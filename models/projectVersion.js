const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const Project = require('./project');

versionSchema = new Schema({
    projectId: {
        type: ObjectId,
        ref: Project,
        required: true
    },
    version:{
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String
    },
    dateOfRelease:{
        type: Number
    }
})

const Version = mongoose.model('Version', versionSchema, 'projectVersion');

module.exports = Version;