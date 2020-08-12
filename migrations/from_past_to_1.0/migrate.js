//Migrates from dark ages to 1.0. In order to launch set the correct database configuration and run this script
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

let CONFIG = require('../../configuration');
let Project = require('../../models/project');
let Issue = require('../../models/issue');
let dbConnPromise = mongoose.connect(CONFIG.mongodb.connection);
dbConnPromise.then(async db => {
	 let projects = await Project.find({}, {columns: 1});
	 projects.forEach(async project => {
	 	project.columns.async.forEach(async issue => {
	 		await Issue.updateOne({_id: issue}, {$set: {projectId: project._id, files: []}});
		});
	 });
});