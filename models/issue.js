const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const User = require('./user');

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
		type: String,
		required: true
	},
	history: [historyEntrySchema],
	checklist: [checklistItemSchema],
	comments: [commentSchema],
	files: [ObjectId],
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
	}
});

const Issue = mongoose.model('Issue', issueSchema, 'issues');
module.exports = Issue;