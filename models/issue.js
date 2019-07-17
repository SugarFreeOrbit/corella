const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;

const historyEntrySchema = new Schema({
	timestamp: {
		type: Number,
		required: true
	},
	message: {
		type: String,
		required: true
	}
});

const checklistItemSchema = new Schema({
	description: {
		type: String,
		required: true
	},
	isDone: {
		type: Boolean,
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
	checklist: [checklistItemSchema]
});

const Issue = mongoose.model('Issue', issueSchema, 'issues');
module.exports = {Issue, issueSchema};