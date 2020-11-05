const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const User = require('./user');
const Project = require('./project');
const Version = require('./version')
const File = require('./file');

const hotfixSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	branch: {
		type: String
	},
	priority: {
		type: Number,
		required: true
	},
	hotfixCode: {
		type: Number,
		required: true
	},
	state: {
		type: Number,
		required: true
	},
	author: {
		type: ObjectId,
		ref: User,
		required: true
	},
	project: {
		type: ObjectId,
		ref: Project,
		required: true
	},
	versionId: {
		type: String,
	},
	created: {
		type: Number
	},
	files: [{
		type: ObjectId,
		ref: File
	}],
});
hotfixSchema.index({created: -1});
hotfixSchema.index({priority: -1});
hotfixSchema.index({state: 1});
hotfixSchema.index({hotfixCode: 1}, {unique:true});

hotfixSchema.statics.validateProjectIdAndHotfixId = async function(projectId, hotfixId){

	let relationTest = await this.findOne({
		_id: hotfixId,
		project: projectId
	}, {hotfixName: 1});
	return !!relationTest;
}

hotfixSchema.statics.checkFileIsAttached = async function (hotfixId, fileId) {
	return (await this.countDocuments({
		_id: hotfixId,
		files: fileId
	})) !== 0;
};

const Hotfix = mongoose.model('Hotfix', hotfixSchema, 'hotfixes');

module.exports = Hotfix;
