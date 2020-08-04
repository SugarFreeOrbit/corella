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
	limit: {
		type: Number
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
		type: Map,//ключи - айдишники колонок, значения - массивы айдишников колонок
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
	createHotfixes: {
		type: Boolean,
		required: true
	},
	deleteHotfixes: {
		type: Boolean,
		required: true
	},
	editHotfixes: {
		type: Boolean,
		required: true
	},
	members: [{
		type: ObjectId,
		ref: User
	}]
}, {_id: false});

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
projectSchema.index({name: 1, "roles.name": 1}, {unique: true});

projectSchema.post('save', function (error, doc , next) {
	if (error.name === 'MongoError' && error.code === 11000) {
		let err = new Error('There was a duplicate key error');
		err.name = 'ValidationError';
		next(err);
	} else {
		next();
	}
});
projectSchema.statics.checkPermission = async function (projectId, userId, permission, isAdmin) {
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
	return !!permissionTest || isAdmin;
};
projectSchema.statics.checkCreatorPermission = async function (projectId, userId, isAdmin) {
	return await this.checkPermission(projectId, userId, 'isCreator', isAdmin);
};
projectSchema.statics.checkDestroyerPermission = async function (projectId, userId, isAdmin) {
	return await this.checkPermission(projectId, userId, 'isDestroyer', isAdmin);
};
projectSchema.statics.checkEditorPermission = async function (projectId, userId, isAdmin) {
	return await this.checkPermission(projectId, userId, 'isEditor', isAdmin);
};
projectSchema.statics.checkManagerPermission = async function (projectId, userId, isAdmin) {
	return await this.checkPermission(projectId, userId, 'isManager', isAdmin);
};
projectSchema.statics.checkCreateHotfixesPermission = async function (projectId, userId, isAdmin) {
	return await this.checkPermission(projectId, userId, 'createHotfixes', isAdmin);
};
projectSchema.statics.checkEditHotfixesPermission = async function (projectId, userId, isAdmin) {
	return await this.checkPermission(projectId, userId, 'editHotfixes', isAdmin);
};
projectSchema.statics.checkDeleteHotfixesPermission = async function (projectId, userId, isAdmin) {
	return await this.checkPermission(projectId, userId, 'deleteHotfixes', isAdmin);
};
projectSchema.statics.checkReaderPermission = async function (projectId, userId, isAdmin) {
	let permissionTest = await this.findOne({
		_id: projectId,
		'roles.members': userId
	}, {projectName: 1});
	return !!permissionTest || isAdmin;
};
projectSchema.statics.validateProjectToIssueRelation = async function(projectId, issueId) {
	let relationTest = await this.findOne({
		_id: projectId,
		'columns.issues': issueId
	}, {projectName: 1});
	return !!relationTest;
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
projectSchema.statics.checkMovePermission = async function (projectId, userId, moveOperation, isAdmin) {
	if(isAdmin) {
		let originalColumnQuery = this.findOne({
			_id: projectId,
			"columns.issues": moveOperation.issueId
		}, {
			"columns.$.id": 1
		});
		let targetColumnQuery = this.findOne({
			_id: projectId,
			"columns.id": moveOperation.targetColumn
		}, {
			"columns.$.id": 1
		});
		let result = await Promise.all([originalColumnQuery, targetColumnQuery]);
		if(result[1] && result[0]) {
			return result[0].columns[0].id;
		} else {
			return false;
		}
	} else {
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
			try {
				if(originalColumn !== moveOperation.targetColumn) {
					if(role.issueTransitionMatrix) {
						return ((role.issueTransitionMatrix.get(originalColumn).includes(moveOperation.targetColumn) || role.isManager) ? originalColumn : false);
					} else {
						return (role.isManager ? originalColumn : false);
					}
				} else {
					return originalColumn;
				}
			} catch (e) {
				return false;
			}
		} else {
			return false;
		}
	}
};
const Project = mongoose.model('Project', projectSchema, 'projects');
module.exports = Project;