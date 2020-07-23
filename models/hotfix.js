const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const User = require('./user');
const Project = require('./project');

const hotfixSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	priority: {
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
	created: {
		type: Number
	},
	attachments: [{
		type: ObjectId
	}]
});
hotfixSchema.index({created: -1});
hotfixSchema.index({priority: -1});
hotfixSchema.index({state: 1});

const Hotfix = mongoose.model('Hotfix', hotfixSchema, 'hotfixes');

module.exports = Hotfix;