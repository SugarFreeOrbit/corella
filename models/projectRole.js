// TODO: Remove this when it's redundancy is proven
// const mongoose = require('mongoose');
// const Schema = require('mongoose').Schema;
// const ObjectId = require('mongoose').Schema.Types.ObjectId;
//
// const projectRoleSchema = new Schema({
// 	name: {
// 		type: String,
// 		required: true
// 	},
// 	isManager: {
// 		type: Boolean,
// 		required: true
// 	},
// 	issueTransitionMatrix: {
// 		type: Map,
// 		of: [ObjectId]
// 	},
// 	isCreator: {
// 		type: Boolean,
// 		required: true
// 	},
// 	isDestroyer: {
// 		type: Boolean,
// 		required: true
// 	}
// });
//
// const ProjectRole = mongoose.model('ProjectRole', projectRole, 'projectRoles');
//
// module.exports = {ProjectRole, projectRoleSchema};