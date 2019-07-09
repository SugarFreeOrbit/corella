const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;

const projectRole = new Schema({
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
	}
});

const ProjectRole = mongoose.model('ProjectRole', projectRole, 'projectRoles');

module.exports = ProjectRole;