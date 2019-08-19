const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const User = require('./user');
const Issue = require('./issue');

const columnSchema = new Schema({
	name: {
		type: String,
		required: true,
		index: true
	},
	isStarting: {
		type: Boolean,
		required: true
	},
	isClosing: {
		type: Boolean,
		required: true
	},
	issues: [{
		required: true,
		type: ObjectId,
		ref: Issue
	}]
});

const projectRoleSchema = new Schema({
	name: {
		type: String,
		required: true,
		index: true
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
		ref: User
	}]
});

const projectSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	roles: [projectRoleSchema],
	columns: [columnSchema],
	isArchived: {
		type: Boolean,
		required: true
	},
	description: String
});
projectSchema.post('save', function (error, doc , next) {
	if (error.name === 'MongoError' && error.code === 11000) {
		let err = new Error('There was a duplicate key error');
		err.name = 'ValidationError';
		next(err);
	} else {
		next();
	}
});
projectSchema.statics.checkPermission = async function (projectId, userId, permission) {
	let permissionTest = await this.findOne({
		_id: projectId,
		$or: [
			{
				roles: {
					$elemMatch: {
						members: userId,
						[permission]: true
					}
				}
			},
			{
				roles: {
					$elemMatch: {
						members: userId,
						isManager: true
					}
				}
			}
		]
	}, {projectName: 1});
	return !!permissionTest;
};
projectSchema.statics.checkCreatorPermission = async function (projectId, userId) {
	return await this.checkPermission(projectId, userId, 'isCreator');
};
projectSchema.statics.checkDestroyerPermission = async function (projectId, userId) {
	return await this.checkPermission(projectId, userId, 'isDestroyer');
};
projectSchema.statics.checkEditorPermission = async function (projectId, userId) {
	return await this.checkPermission(projectId, userId, 'isEditor');
};
projectSchema.statics.checkManagerPermission = async function (projectId, userId) {
	return await this.checkPermission(projectId, userId, 'isManager');
};
projectSchema.statics.checkReaderPermission = async function (projectId, userId) {
	let permissionTest = await this.findOne({
		_id: projectId,
		'roles.members': userId
	}, {projectName: 1});
	return !!permissionTest;
};
const Project = mongoose.model('Project', projectSchema, 'projects');
module.exports = Project;