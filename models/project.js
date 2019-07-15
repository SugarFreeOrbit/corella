const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const userSchema = require('./user').userSchema;
const boardSchema = require('./board').boardSchema;

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
	}
});
projectRoleSchema.index({name: 1});

const projectMemberSchema = new Schema({
	user: {
		type: ObjectId,
		required: true,
		ref: userSchema,
		index: true
	},
	role: {
		type: ObjectId,
		ref: projectRoleSchema,
		required: true
	}
}, {_id: false});
projectMemberSchema.index({user: 1});

const projectSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	boards: [{
		re
	}],
	roles: [projectRoleSchema],
	users: [projectMemberSchema]
});

const Project = mongoose.model('Project', projectSchema, 'projects');
module.exports = {Project, projectSchema};