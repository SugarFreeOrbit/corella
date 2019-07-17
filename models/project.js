const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const userSchema = require('./user').userSchema;
const issueSchema = require('./issue').issueSchema;

const columnSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	isStarting: {
		type: Boolean,
		required: true
	},
	isClosing: {
		type: Boolean,
		required: true
	},
	issues: {
		required: true,
		type: [ObjectId],
		ref: issueSchema
	}
});

const projectRoleSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	isManager: {
		type: Boolean,
		required: true
	},
	issueTransitionMatrix: {
		type: Map,
		of: [ObjectId]
	},
	isCreator: {
		type: Boolean,
		required: true
	},
	isDestroyer: {
		type: Boolean,
		required: true
	},
	isEditor: {
		type: Boolean,
		required: true
	},
	members: [{
		type: ObjectId,
		ref: userSchema
	}]
});

const projectSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	roles: [projectRoleSchema],
	columns: [columnSchema]
});

const Project = mongoose.model('Project', projectSchema, 'projects');
module.exports = {Project, projectSchema};