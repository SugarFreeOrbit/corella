const router = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;
const validator = require('../utils/validation/validator');
const Project = require('../models/project');
const Issue = require('../models/issue');
const Hotfix = require('../models/hotfix');
const Version = require('../models/version');
const File = require('../models/file');
const Counter = require('../models/counter');
const md5 = require('md5');
//const multer = require('multer');
//const upload = multer({dest: '../tmp'});
const websocketService = require('../services/websocketService');
const contentDisposition = require('content-disposition');

router.put('/', [validator.checkBody('newProject')],  function (req, res) {
	if(req.user.isAdmin) {
		let preparedColumns = req.body.columns.map(column => {
			column.id = md5(req.body.name + column.name);
			column.isStarting = false;
			column.isClosing = false;
			return column;
		});
		preparedColumns[0].isStarting = true;
		preparedColumns[preparedColumns.length - 1].isClosing = true;
		let newProject = new Project({
			name: req.body.name,
			description: req.body.description,
			columns: preparedColumns,
			isArchived: false,
			roles: req.body.roles
		});
		newProject.save().then(() => {
			res.status(201);
			res.end();
		}).catch((err) => {
			logger.debug(err.toString());
			if (err.name === 'ValidationError'){
				res.status(400);
			} else {
				res.status(500);
			}
			res.json(err.message);
		});
	} else {
		res.status(403);
		res.end();
	}
});

router.get('/', function (req, res, next) {
	if(req.user.isAdmin) {
		Project.find({isArchived: false}, {name: 1, description: 1}).then(projects => {
			res.status(200);
			res.json(projects);
		}).catch((err)=> {
			logger.debug(err.toString());
			res.status(500);
			res.end();
		});
	} else {
		Project.find({isArchived: false, roles: {$elemMatch: {members: req.user._id}}}, {name: 1, description: 1}).then(projects => {
			res.status(200);
			res.json(projects);
		}).catch((err)=> {
			logger.debug(err.toString());
			if (err.name === 'ValidationError'){
				res.status(400);
			} else {
				res.status(500);
			}
			res.json(err.message);
		});
	}
});

router.delete('/:projectId', [validator.checkParamsForObjectIds()], async function (req, res ,next) {
	try {
		if (req.user.isAdmin) {
			let project = await Project.findOneAndDelete({_id: req.params.projectId});
			if (project) {
				let issues = await Issue.find({projectId: req.params.projectId}, {files: 1});
				let files = [];
				if (issues && issues.length) {
					await Issue.deleteMany({projectId: req.params.projectId});
					issues.forEach(issue => files = files.concat(issue.files || []));
				}
				let hotfixes = await Hotfix.find({project: req.params.projectId}, {files: 1});
				if (hotfixes && hotfixes.length) {
					await Hotfix.deleteMany({project: req.params.projectId});
					hotfixes.forEach(hotfix => files = files.concat(hotfix.files || []));
				}
				await Promise.all(files.map(File.deleteById));
				res.status(200);
			} else {
				res.status(404);
			}
			res.end();
		} else {
			res.status(403);
			res.end();
		}
	} catch (e) {
		next(e);
	}
});

router.get('/:projectId/roles', [validator.checkParamsForObjectIds()], function (req, res) {
	if(req.user.isAdmin) {
		Project.findOne({_id: req.params.projectId}, {roles: 1}).then(roleList => {
			if(roleList) {
				res.status(200);
				res.json(roleList);
			} else {
				res.status(404);
				res.end();
			}
		}).catch(err => {
			logger.debug(err.toString());
			if (err.name === 'ValidationError'){
				res.status(400);
			} else {
				res.status(500);
			}
			res.json(err.message);
		});
	} else {
		let permissionQuery = Project.findOne({_id: req.params.projectId, roles: {$elemMatch: {members: req.user._id, isManager: true}}}, {"roles.isManager": 1});
		let dataQuery = Project.findOne({_id: req.params.projectId, roles: {$elemMatch: {members: req.user._id, isManager: true}}}, {roles: 1});
		Promise.all([permissionQuery, dataQuery]).then(results => {
			if(results[0] && results[1]) {
				res.status(200);
				res.json(results[1]);
			} else {
				if(!results[0]) {
					res.status(403);
					res.end();
				} else {
					res.status(404);
					res.end();
				}
			}
		}).catch(err => {
			logger.debug(err.toString());
			if (err.name === 'ValidationError'){
				res.status(400);
			} else {
				res.status(500);
			}
			res.json(err.message);
		});
	}
});

router.get('/:projectId/roles/me', [validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		let currentRoleQuery = await Project.findOne({
			_id: req.params.projectId,
			'roles.members': req.user._id
		}, {
			'roles.$': 1
		});
		if (currentRoleQuery) {
			if (currentRoleQuery.roles.length > 0) {
				currentRoleQuery.roles[0].members = undefined;
				res.json(currentRoleQuery.roles[0]);
			} else {
				res.status(404);
				res.end()
			}
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.patch('/:projectId/roles', [validator.checkBody('roles'), validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		let names = new Set();
		req.body.forEach(role => names.add(role.name));
		if (names.size !== req.body.length) {
			res.status(400);
			res.end();
		} else {
			if (await Project.checkManagerPermission(req.params.projectId, req.user._id, req.user.isAdmin)) {
				await Project.findOneAndUpdate({_id: req.params.projectId}, {roles: req.body});
				res.status(200);
				res.end();
			} else {
				res.status(403);
				res.end();
			}
		}
	} catch (e) {
		next(e);
	}
});

//issue manipulations go here
router.put('/:projectId/issues', [validator.checkParamsForObjectIds(), File.uploadFiles, validator.checkBody('newIssue')], async function (req, res, next) {
	try {
		if(await Project.checkCreatorPermission(req.params.projectId, req.user._id, req.user.isAdmin)) {
			let files = [];
			if (req.files) {
				files = await Promise.all(req.files.map(File.uploadToGridFS));
			}
			if(req.body.versionId !== undefined){
				let versionCount = await Version.countDocuments({_id: req.body.versionId, projectId: req.params.projectId});
				if(versionCount === 0){
					res.status(404);
					res.json("Project version not found");
					res.end();
					return;
				}
			} else{
				req.body.versionId = "";
			}
			let issueCode = await Counter.getNextSequenceCount();
			let newIssue = new Issue({
				projectId: req.params.projectId,
				title: req.body.title,
				description: (req.body.description) ? req.body.description : "",
				checklist: req.body.checklist,
				files: files,
				issueCode: issueCode,
				author: req.user._id,
				versionId: req.body.versionId
			});
			await newIssue.save();
			await Project.findOneAndUpdate({
				_id: req.params.projectId,
				"columns.isStarting": true
			}, {
				$push: {
					"columns.$.issues": newIssue
				}
			});
			websocketService.emitNewIssue(newIssue._id, req.params.projectId);
			res.status(201);
			res.end();
		} else {
			File.clearTempFiles(req.files);
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		File.clearTempFiles(req.files);
		next(e);
	}
});

// attaches new files to existing issues
router.post('/:projectId/issues/:issueId/attach', [validator.checkParamsForObjectIds(), File.uploadFiles], async function (req, res, next) {
	try {
		let projectPermissionQueries = await Promise.all([
			Project.validateProjectToIssueRelation(req.params.projectId, req.params.issueId),
			Project.checkEditorPermission(req.params.projectId, req.user._id, req.user.isAdmin)
		]);
		if ((projectPermissionQueries[1] && projectPermissionQueries[0])) {
			let files = [];
			if (req.files) {
				files = await Promise.all(req.files.map(File.uploadToGridFS));
				await Issue.findByIdAndUpdate(req.params.issueId, {
					$push: {files}
				});
				websocketService.emitUpdatedIssue(req.params.issueId, req.params.projectId);
			}
			res.json(files);
		} else {
			File.clearTempFiles(req.files);
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		File.clearTempFiles(req.files);
		next(e);
	}
});

// downloads attachment based on it's id
router.get('/:projectId/issues/:issueId/attachment/:fileId', [validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		let projectPermissionQueries = await Promise.all([
			Project.validateProjectToIssueRelation(req.params.projectId, req.params.issueId),
			Project.checkReaderPermission(req.params.projectId, req.user._id, req.user.isAdmin),
			Issue.checkFileIsAttached(req.params.issueId, req.params.fileId)
		]);
		if ((projectPermissionQueries[2] && projectPermissionQueries[1] && projectPermissionQueries[0])) {
			let downloadStream = File.downloadById(ObjectId(req.params.fileId));
			downloadStream.on('file', file => {
				res.header('Content-Disposition', contentDisposition(file.filename));
				res.type(file.contentType);
			});
			downloadStream.on('data', chunk => {
				res.write(chunk);
			});
			downloadStream.on('end', () => {
				res.end();
			});
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.delete('/:projectId/issues/:issueId', [validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		if ((await Project.checkDestroyerPermission(req.params.projectId, req.user._id, req.user.isAdmin))) {
			let deleteIssue = await Issue.findOneAndDelete({
				_id: ObjectId(req.params.issueId),
				projectId: ObjectId(req.params.projectId)
			});
			if (!deleteIssue) {
				res.status(404);
				res.end();
				return;
			}

			await Project.findByIdAndUpdate(req.params.projectId, {
				$pull: {
					'columns.$[].issues': req.params.issueId
				}
			});

			await Promise.all(deleteIssue.files.map(File.deleteById));
			websocketService.emitDeletedIssue(req.params.issueId, req.params.projectId);
			res.status(200);
			res.end();
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.patch('/:projectId/issues/:issueId', [validator.checkBody('newIssue'), validator.checkParamsForObjectIds()],  async function (req, res, next) {
	try {
		if((await Project.checkEditorPermission(req.params.projectId, req.user._id, req.user.isAdmin))) {

			if(req.body.versionId !== undefined){
				let versionCount = await Version.countDocuments({_id: req.body.versionId, projectId: req.params.projectId});
				if(versionCount === 0){
					res.status(404);
					res.json("Project version not found");
					res.end();
					return;
				}
			} else{
				req.body.versionId = "";
			}
			let matchedIssuesCount = (await Issue.updateOne({_id: ObjectId(req.params.issueId), projectId: req.params.projectId}, {
				title: req.body.title,
				description: (req.body.description) ? req.body.description : "",
				checklist: req.body.checklist,
				author: req.user._id,
				versionId: req.body.versionId
			})).n;
			if(matchedIssuesCount === 0) {
				res.status(404);
				res.end();
			}
			else {
				websocketService.emitUpdatedIssue(req.params.issueId, req.params.projectId);
				res.status(200);
				res.end();
			}
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.get('/:projectId/columns', [validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		if(await Project.checkReaderPermission(req.params.projectId, req.user._id, req.user.isAdmin)) {
			let project = await Project.findById(req.params.projectId, {
				columns: 1
			});
			// project.populate({
			// 	path: "columns.issues",
			// 	select: "title color assignee"
			// });
			// await project.execPopulate();
			res.json(project);
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.get('/:projectId/issues/:issueId', [validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		if(await Project.checkReaderPermission(req.params.projectId, req.user._id, req.user.isAdmin)) {
			let issue = await Issue.findOne({_id: ObjectId(req.params.issueId), projectId: ObjectId(req.params.projectId)}).populate('files', 'filename length');
			if(!issue) {
				res.status(404);
				res.end();
				return;
			}
			res.json(issue);
		} else {
			res.status(401);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.get('/:projectId/issues', [validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		if(await Project.checkReaderPermission(req.params.projectId, req.user._id, req.user.isAdmin)) {
			let issue = await Issue.findOne({issueCode: req.query.issueCode, projectId: ObjectId(req.params.projectId)}).populate('files', 'filename length');
			if(!issue) {
				res.status(404);
				res.end();
				return;
			}
			res.json(issue);
		} else {
			res.status(401);
			res.end();
		}
	} catch (e) {
		next(e);
	}
});

router.delete('/:projectId/issues/:issueId/detach/:fileId', async function (req, res, next) {
	try {
		if ((await Project.checkEditorPermission(req.params.projectId, req.user._id, req.user.isAdmin))) {
			let issueModifiedCount = (await Issue.updateOne({_id: ObjectId(req.params.issueId), projectId: ObjectId(req.params.projectId)}, {
				$pull: { files: req.params.fileId }
			})).nModified;
			if(issueModifiedCount=== 0) {
				res.status(404);
				res.end();
			}
			else {
				await File.deleteById(ObjectId(req.params.fileId));
				websocketService.emitUpdatedIssue(req.params.issueId, req.params.projectId);
				res.status(200);
				res.end();
			}
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.post('/:projectId/issues/move', [validator.checkBody('moveOperation'), validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		let originalColumn = await Project.checkMovePermission(req.params.projectId, req.user._id, req.body, req.user.isAdmin);
		if (originalColumn || req.user.isAdmin) {
			// await Project.findOneAndUpdate({
			// 	_id: req.params.projectId,
			// 	"columns.id": originalColumn
			// }, {
			// 	$pull: {
			// 		"columns.$.issues": req.body.issueId
			// 	}
			// });
			// await Project.findOneAndUpdate({
			// 	_id: req.params.projectId,
			// 	"columns.id": req.body.targetColumn
			// }, {
			// 	$push: {
			// 		"columns.$.issues": {
			// 			$each: [req.body.issueId],
			// 			$position: req.body.targetPosition
			// 		}
			// 	}
			// });
			let detach = await Project.findOneAndUpdate({
				_id: req.params.projectId,
				"columns.id": originalColumn
			}, {
				$pull: {
					"columns.$.issues": req.body.issueId
				}
			});
			let attach = await Project.findOneAndUpdate({
				_id: req.params.projectId,
				"columns.id": req.body.targetColumn
			}, {
				$push: {
					"columns.$.issues": {
						$each: [req.body.issueId],
						$position: req.body.targetPosition
					}
				}
			});
			await Promise.all([detach, attach]);
			websocketService.emitMovedIssue({
				issueId: req.body.issueId,
				originalColumn,
				targetColumn: req.body.targetColumn,
				targetPosition: req.body.targetPosition
			}, req.params.projectId);
			res.status(200);
			res.end();
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.get('/:projectId/meta', [validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		if(await Project.checkReaderPermission(req.params.projectId, req.user._id, req.user.isAdmin)) {
			let projectMeta = await Project.findById(req.params.projectId, {name: 1});
			res.json(projectMeta);
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e)
	}
});


router.put('/:projectId/hotfixes', [validator.checkParamsForObjectIds(), File.uploadFiles, validator.checkBody('newHotfix')], async function (req, res, next) {
	try {
		if (await Project.checkCreateHotfixesPermission(req.params.projectId, req.user._id, req.user.isAdmin)) {
			let files = [];
			if (req.files) {
				files = await Promise.all(req.files.map(File.uploadToGridFS));
			}
			if(req.body.versionId !== undefined){
				let versionCount = await Version.countDocuments({_id: req.body.versionId, projectId: req.params.projectId});
				if(versionCount === 0){
					res.status(404);
					res.json("Project version not found");
					res.end();
					return;
				}
			} else{
				req.body.versionId = "";
			}
			let hotfixCode = await Counter.getNextSequenceCount();
			let newHotfix = new Hotfix({
				title: req.body.title,
				description: req.body.description,
				branch: req.body.branch,
				priority: + req.body.priority,
				state: 1,
				created: Date.now(),
				files: files,
				project: ObjectId(req.params.projectId),
				hotfixCode: hotfixCode,
				author: ObjectId(req.user._id),
				versionId: req.body.versionId
			});
			await newHotfix.save();
			websocketService.emitNewHotfix(newHotfix._id, req.params.projectId);
			res.status(200);
			res.end();
		} else {
			File.clearTempFiles(req.files);
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
})

router.patch('/:projectId/hotfixes/:hotfixId', [validator.checkBody('updateHotfix'), validator.checkParamsForObjectIds()],  async function (req, res, next) {
	try {
		let projectPermissionQueries = await Promise.all([
			Hotfix.validateProjectIdAndHotfixId(req.params.projectId, req.params.hotfixId),
			Project.checkEditHotfixesPermission(req.params.projectId, req.user._id, req.user.isAdmin)]);
		if((projectPermissionQueries[0] && projectPermissionQueries[1])) {
			if(req.body.versionId !== undefined){
				let versionCount = await Version.countDocuments({_id: req.body.versionId, projectId: req.params.projectId});
				if(versionCount === 0){
					res.status(404);
					res.json("Project version not found");
					res.end();
					return;
				}
			} else{
				req.body.versionId = "";
			}
			await Hotfix.findByIdAndUpdate(req.params.hotfixId, {
				title: req.body.title,
				description: (req.body.description) ? req.body.description : "",
				branch: (req.body.branch) ? req.body.branch : "",
				priority: req.body.priority,
				state: req.body.state,
				author: req.user._id,
				versionId: req.body.versionId
			});
			websocketService.emitUpdatedHotfix(req.params.hotfixId, req.params.projectId);
			res.status(200);
			res.end();
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.post('/:projectId/hotfixes/:hotfixId/attach', [validator.checkParamsForObjectIds(), File.uploadFiles], async function (req, res, next){
	try {
		let projectPermissionQueries = await Promise.all([
			Hotfix.validateProjectIdAndHotfixId(req.params.projectId, req.params.hotfixId),
			Project.checkEditHotfixesPermission(req.params.projectId, req.user._id, req.user.isAdmin)
		]);

		if ((projectPermissionQueries[1] && projectPermissionQueries[0])){
			let files = [];
			if (req.files) {
				files = await Promise.all(req.files.map(File.uploadToGridFS));
				await Hotfix.findByIdAndUpdate(req.params.hotfixId, {
					$push: {files}
				});
				websocketService.emitUpdatedHotfix(req.params.hotfixId, req.params.projectId);
			}
			res.json(files);
		}
		else{
			File.clearTempFiles(req.files);
			res.status(403);
			res.json("You don't have permission");
		}
	}catch (e) {
		File.clearTempFiles(req.files);
		next(e);
	}
});

router.delete('/:projectId/hotfixes/:hotfixId/detach/:fileId', async function (req, res, next){
	try{
		let projectPermissionQueries = await Promise.all([
			Hotfix.validateProjectIdAndHotfixId(req.params.projectId, req.params.hotfixId),
			Project.checkDeleteHotfixesPermission(req.params.projectId, req.user._id, req.user.isAdmin)
		]);
		if ((projectPermissionQueries[1] && projectPermissionQueries[0])){
			let modified = (await Hotfix.updateOne({_id: ObjectId(req.params.hotfixId)}, {
				$pull: { files: req.params.fileId }
			}));
			if(modified.nModified === 0) {
				res.status(404);
			}
			else {
				await File.deleteById(ObjectId(req.params.fileId));
				websocketService.emitUpdatedHotfix(req.params.hotfixId, req.params.projectId);
				res.status(200);
			}
			res.end();
		} else {
			res.status(403);
			res.json("You don't have permission");
		}
	} catch (e) {
		next(e);
	}
});

router.delete('/:projectId/hotfixes/:hotfixId', [validator.checkParamsForObjectIds()], async function (req, res, next){
	try {
		let projectPermissionQueries = await Promise.all([
			Hotfix.validateProjectIdAndHotfixId(req.params.projectId, req.params.hotfixId),
			Project.checkDeleteHotfixesPermission(req.params.projectId, req.user._id, req.user.isAdmin)
		]);
		if ((projectPermissionQueries[1] && projectPermissionQueries[0])){
			let deleteHotfix = await Hotfix.findByIdAndRemove(req.params.hotfixId);
			await Promise.all(deleteHotfix.files.map(File.deleteById));
			websocketService.emitDeletedHotfix(req.params.issueId, req.params.projectId);
			res.status(200);
			res.end();
		}else{
			res.status(403);
			res.json("You don't have permission");
		}
	}catch (e) {
		next(e);
	}
});

router.get('/:projectId/hotfixes/:hotfixId/attached/:fileId', [validator.checkParamsForObjectIds()], async function (req, res, next){
	try {
		let projectPermissionQueries = await Promise.all([
			Hotfix.validateProjectIdAndHotfixId(req.params.projectId, req.params.hotfixId),
			Hotfix.checkFileIsAttached(req.params.hotfixId, req.params.fileId),
			Project.checkReaderPermission(req.params.projectId, req.user._id, req.user.isAdmin)
		]);
		if ((projectPermissionQueries[2] && projectPermissionQueries[1] && projectPermissionQueries[0])){
			let downloadStream = File.downloadById(ObjectId(req.params.fileId));
			downloadStream.on('file', file => {
				res.header('Content-Disposition', contentDisposition(file.filename));
				res.type(file.contentType);
			});
			downloadStream.on('data', chunk => {
				res.write(chunk);
			});
			downloadStream.on('end', () => {
				res.end();
			});
		} else{
			res.status(403);
			res.json("You don't have permission");
		}
	}catch (e) {
		next(e);
	}
})

router.get('/:projectId/hotfixes', [validator.checkParamsForObjectIds(), validator.checkQuery('getHotfixesQuery')],
	async function (req, res, next) {
		try {
			if (await Project.checkReaderPermission(req.params.projectId, req.user._id, req.user.isAdmin)) {
				if (req.query.hotfixCode) {
					let hotfix = await Hotfix.findOne({
						hotfixCode: req.query.hotfixCode,
						project: ObjectId(req.params.projectId)
					}).populate('files', 'filename length');
					if (hotfix) {
						res.json(hotfix);
					} else {
						res.status(404);
						res.end();
					}
				} else {
					let limit = parseInt(req.query.limit) || 10;
					let page = parseInt(req.query.page) || 1;
					let sortingParams = {
						priority: -1,
						state: 1,
						created: -1
					};
					let query;
					if (req.query.showCompleted === "true") {
						if (req.query.findByTitle !== undefined) {
							query = {
								$and: [{project: req.params.projectId},
									{title: {$regex: req.query.findByTitle, $options: "i"}}
								]
							};
						} else {
							query = {project: req.params.projectId};
						}
					} else {
						if (req.query.findByTitle !== undefined) {
							query = {
								$and: [{project: req.params.projectId}, {state: {$lt: 3}},
									{title: {$regex: req.query.findByTitle, $options: "i"}}
								]
							};
						} else {
							query = {
								project: req.params.projectId,
								state: {$lt: 3}
							};
						}
					}
					let results = await Promise.all([
						Hotfix.find(query)
							.sort(sortingParams)
							.skip((page - 1) * limit)
							.limit(limit)
							.populate('files', 'filename length'),
						Hotfix.countDocuments(query)]);
					let totalCount = results[1];
					res.json({
						total: totalCount,
						pageCount: Math.ceil(totalCount / limit),
						data: results[0]
					});
				}
			}else{
				res.status(403);
				res.json("You don't have permission");
			}
		}catch (e) {
			next(e);
		}
	});

router.patch('/:projectId/:columnId/limit', [validator.checkBody('updateWIPLimit'), validator.checkParamsForObjectIds(`columnId`)], async function(req, res, next) {
	try {
		let permissions = await Promise.all([
			Project.checkEditorPermission(req.params.projectId, req.user._id, req.user.isAdmin),
			Project.checkManagerPermission(req.params.projectId, req.user._id, req.user.isAdmin),
			Project.validateProjectToColumnRelation(req.params.projectId, req.params.columnId)]);
		if (permissions[0] && permissions[1] && permissions[2]) {

			let matchedCount = (await Project.updateOne({
					_id:req.params.projectId, 'columns.id': req.params.columnId
				},
				{
					$set:{'columns.$.limit': req.body.limit}
				})).n;
			if (matchedCount === 0) {
				res.status(400);
			} else
				res.status(200);
		}
		else {
			res.status(403);
		}
		res.end();
	}
	catch (e) {
		next(e);
	}
});

router.put('/:projectId/versions', [validator.checkParamsForObjectIds(), validator.checkBody("createVersion")],
	async function (req, res, next){
	try{
		if(await Project.checkUpdateVersion(req.params.projectId, req.user._id, req.user.isAdmin)){
			let newVersion = new Version({
				projectId: req.params.projectId,
				version: req.body.version,
				description: req.body.description,
				dateOfRelease: req.body.dateOfRelease
			});
			try{
				await newVersion.save();
			}
			catch (e){
				res.status(400);
				res.json("Version name must be unique");
				res.end();
				return
			}
			res.status(200);
			res.end();
		}
		else{
			res.status(403);
			res.json("You don't have permission");
		}
	}
	catch (e){
		next(e);
	}
});

router.get('/:projectId/versions', [validator.checkParamsForObjectIds()],
	async function (req, res, next){
	try{
		if(await Project.checkViewVersion(req.params.projectId, req.user._id, req.user.isAdmin)) {
			Version.find({projectId: req.params.projectId}).then(versions => {
				res.status(200);
				res.json(versions);
			}).catch((err) => {
				logger.debug(err.toString());
				res.status(500);
				res.end();
			});
		}
		else{
			res.status(403);
			res.json("You don't have permission");
		}
	}
	catch (e){
		next(e);
	}
});

router.get('/:projectId/issue-version', [validator.checkParamsForObjectIds()],
	async function (req, res, next){
		try{
				Version.find({projectId: req.params.projectId}).then(versions => {
					res.status(200);
					res.json(versions);
				}).catch((err) => {
					logger.debug(err.toString());
					res.status(500);
					res.end();
				});
		}
		catch (e){
			next(e);
		}
	});

router.get('/:projectId/versions/:versionId', [validator.checkParamsForObjectIds()],
	async function (req, res, next){
	try{
		if(await  Project.checkViewVersion(req.params.projectId, req.user._id, req.user.isAdmin)){
			Version.find({_id: req.params.versionId}).then(version =>{
				res.status(200);
				res.json(version);
			}).catch((err) => {
				logger.debug(err.toString());
				res.status(500);
				res.end();
			});
		}
		else{
			res.status(403);
			res.json("You don't have permission");
		}
	}
	catch (e){
		next(e);
	}
});

router.patch('/:projectId/versions/:versionId', [validator.checkParamsForObjectIds(), validator.checkBody('editVersion')],
	async function (req, res, next){
	try{
		if(await Project.checkUpdateVersion(req.params.projectId, req.user._id, req.user.isAdmin)){
			try{
				await Version.findOneAndUpdate({_id: req.params.versionId}, {
					version: req.body.version,
					description: req.body.description,
					dateOfRelease: req.body.dateOfRelease
				});
			}
			catch (e){
				res.status(400);
				res.json("Version name must be unique");
				res.end();
				return
			}
			res.status(200);
			res.end();
		}
		else{
			res.status(403);
			res.json("You don't have permission");
		}
	}
	catch (e){
		next(e);
	}
});

router.delete('/:projectId/versions/:versionId', [validator.checkParamsForObjectIds()],
	async function (req, res, next){
		try{
			if(await Project.checkUpdateVersion(req.params.projectId, req.user._id, req.user.isAdmin)){

				await Hotfix.update({versionId: ObjectId(req.params.versionId)}, {versionId: ""})
				await Issue.update({versionId: ObjectId(req.params.versionId)}, {versionId: ""})
				await Version.findByIdAndRemove(req.params.versionId);
				res.status(200);
				res.end();
			}
			else{
				res.status(403);
				res.json("You don't have permission");
			}
		}
		catch (e) {
			next(e)
		}
	});

module.exports = router;
