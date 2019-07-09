const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;

const projectUserSchema = new Schema({
	user: {
		type: ObjectId,
		required: true
	},
	role: {
		type: ObjectId
	}
}, {_id: false});

const projectSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	boards: [ObjectId],
	roles: [ObjectId],
	users: [projectUserSchema]
});