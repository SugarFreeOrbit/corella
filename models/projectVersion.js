const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const Project = require('./project');

versionSchema = new Schema({
    project: {
        type: ObjectId,
        ref: Project,
        required: true
    },
    version:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    timestamp:{
        type: Number
    }
})

const Version = mongoose.model('Version', versionSchema, 'projectVersion');

module.exports = Version;