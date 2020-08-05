const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const User = require('./user');
const File = require('./file')

const historyEntrySchema = new Schema({
	timestamp: {
		type: Number,
		required: true
	},
	message: {
		type: String,
		required: true
	}
}, {_id: false});

const checklistItemSchema = new Schema({
	description: {
		type: String,
		required: true
	},
	isDone: {
		type: Boolean,
		required: true
	}
}, {_id: false});

const commentSchema = new Schema({
	author: {
		type: ObjectId,
		required: true,
		ref: User
	},
	content: {
		type: String,
		required: true
	},
	timestamp: {
		type: Number,
		required: true
	}
});

const issueSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	history: [historyEntrySchema],
	checklist: [checklistItemSchema],
	comments: [commentSchema],
	files: [{
		type: ObjectId,
		ref: File
	}],
	author: {
		type: ObjectId,
		ref: User,
		required: true
	},
	assignee: {
		type: ObjectId,
		ref: User
	},
	color: {
		type: String,
		enum: [
			"green",
			"blue",
			"pink",
			"orange",
			"yellow"
		]
	},
	issueCode: {
		type: Number,
		required: true
	}
});

issueSchema.index({issueCode:1}, {unique:true});

// Expects an array of multer files
// Issue.methods.addAttachments = async function (localFiles) {
//
// };
issueSchema.statics.checkFileIsAttached = async function (issueId, fileId) {
	return (await this.countDocuments({
		_id: issueId,
		files: fileId
	})) !== 0;
};

const Issue = mongoose.model('Issue', issueSchema, 'issues');
module.exports = Issue;