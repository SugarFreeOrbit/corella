const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const User = require('./user');
const Issue = require('./issue');

//Issue object and it's components
// const historyEntrySchema = new Schema({
// 	timestamp: {
// 		type: Number,
// 		required: true
// 	},
// 	message: {
// 		type: String,
// 		required: true
// 	}
// }, {_id: false});
//
// const checklistItemSchema = new Schema({
// 	description: {
// 		type: String,
// 		required: true
// 	},
// 	isDone: {
// 		type: Boolean,
// 		required: true
// 	}
// }, {_id: false});
//
// const commentSchema = new Schema({
// 	author: {
// 		type: ObjectId,
// 		required: true,
// 		ref: User
// 	},
// 	content: {
// 		type: String,
// 		required: true
// 	},
// 	timestamp: {
// 		type: Number,
// 		required: true
// 	}
// });
//
// const issueSchema = new Schema({
// 	title: {
// 		type: String,
// 		required: true
// 	},
// 	description: {
// 		type: String,
// 		required: true
// 	},
// 	history: [historyEntrySchema],
// 	checklist: [checklistItemSchema],
// 	comments: [commentSchema],
// 	files: [ObjectId]
// });
//
//Project object and it's components
const columnSchema = new Schema({
	name: {
		type: String,
		required: true,
		index: true
	},
	id: {
		type: String,
		required: true,
		unique: true
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
		type: ObjectId,
		ref: Issue
	}]
}, {_id: false});

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
		of: [String]
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
// projectSchema.statics.checkMovePermission = async function (projectId, userId, moveOperation) {
// 	if(moveOperation.targetColumn !== moveOperation.originalColumn) {
// 		let project = await this.findOne({
// 			_id: projectId,
// 			"roles.members": userId
// 		}, {
// 			"roles.issueTransitionMatrix": 1,
// 			"roles.isManager": 1,
// 			_id: -1
// 		});
// 		let role = project.roles[0];
// 		if(role.issueTransitionMatrix) {
// 			return (role.issueTransitionMatrix[moveOperation.originalColumn].find(moveOperation.targetColumn) || role.isManager)
// 		} else {
// 			return role.isManager
// 		}
// 	} else {
// 		let permissionTest = await this.findOne({
// 			_id: projectId,
// 			'roles.members': userId
// 		}, {projectName: 1});
// 		return !!permissionTest;
// 	}
// };
projectSchema.statics.checkMovePermission = async function (projectId, userId, moveOperation) {
	let roleQuery = this.findOne({
		_id: projectId,
		"roles.members": userId
	}, {
		"roles.$.issueTransitionMatrix": 1,
		"roles.isManager": 1
	});
	let columnQuery = this.findOne({
		_id: projectId,
		"columns.issues": moveOperation.issueId
	}, {
		"columns.$.id": 1
	});
	let results = await Promise.all([roleQuery, columnQuery]);
	if(results[1].columns && results[0].roles) {
		let originalColumn = results[1].columns[0].id;
		let role = results[0].roles[0];
		if(originalColumn !== moveOperation.targetColumn) {
			if(role.issueTransitionMatrix) {
				return (originalColumn ? (role.issueTransitionMatrix[originalColumn].find(moveOperation.targetColumn) || role.isManager) : false);
			} else {
				return (originalColumn ? role.isManager : false);
			}
		} else {
			return originalColumn;
		}
	} else {
		return false;
	}

};
const Project = mongoose.model('Project', projectSchema, 'projects');
module.exports = Project;