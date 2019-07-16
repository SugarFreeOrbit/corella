const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const userSchema = require('./user').userSchema;

const columnSchema = new Schema({

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
	members: [{
		type: ObjectId,
		ref: userSchema
	}]
});

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
});

const projectSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	roles: [projectRoleSchema],
	columns: []
});

const Project = mongoose.model('Project', projectSchema, 'projects');
module.exports = {Project, projectSchema};