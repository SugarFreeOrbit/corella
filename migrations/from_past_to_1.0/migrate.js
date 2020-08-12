//Migrates from dark ages to 1.0. In order to launch set the correct database configuration and run this script
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

let CONFIG = require('../../configuration');
let Project = require('../../models/project');
let Issue = require('../../models/issue');
let Counter = require('../../models/counter');
let dbConnPromise = mongoose.connect(CONFIG.mongodb.connection);
dbConnPromise.then(async db => {
	 console.log("Connected to db");
	 let projects = await Project.find({}, {columns: 1});
	 for (let i= 0; i < projects.length; i++) {
		 for (let j = 0; j < projects[i].columns.length; j++) {
		 	try {
				let nextCode = await Counter.getNextSequenceCount();
				await Issue.updateOne({_id: projects[i].columns[j]}, {$set: {projectId: projects[i]._id, files: [], issueCode: nextCode}});
			} catch (e) {
				console.log(`Woops, something went wrong! Issue id: ${projects[i].columns[j]}, project id: ${projects[i]._id}`);
				console.log(e);
			}
		 }
	 }
	 console.log('Migration has finished');
});