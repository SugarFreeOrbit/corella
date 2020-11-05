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
    },
    description:{
        type: String
    },
    dateOfRelease:{
        type: Number
    }
})
versionSchema.index({projectId: 1, version: 1}, {unique: true});

const Version = mongoose.model('Version', versionSchema, 'versions');

module.exports = Version;