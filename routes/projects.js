const router = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;
const validator = require('../utils/validation/validator');
const Project = require('../models/project');
const Issue = require('../models/issue');
const Hotfix = require('../models/hotfix');
const File = require('../models/file')
const md5 = require('md5');
//const multer = require('multer');
//const upload = multer({dest: '../tmp'});
const websocketService = require('../services/websocketService');

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

router.delete('/:projectId', [validator.checkParamsForObjectIds()], function (req, res ,next) {
	if(req.user.isAdmin) {
		Project.deleteOne({_id: req.params.projectId}).then(() => {
			res.status(200);
			res.end();
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
		res.status(403);
		res.end();
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
		if (currentRoleQuery.roles.length > 0) {
			currentRoleQuery.roles[0].members = undefined;
			res.json(currentRoleQuery.roles[0]);
		} else {
			res.status(404);
			res.end()
		}
	} catch (e) {
		next(e);
	}
});

router.patch('/:projectId/roles', [validator.checkBody('roles'), validator.checkParamsForObjectIds()], function (req, res, next) {
	let names = new Set();
	req.body.forEach(role => names.add(role.name));
	if(names.size !== req.body.length) {
		res.status(400);
		res.end();
	} else {
		if(req.user.isAdmin) {
			Project.findOneAndUpdate({_id: req.params.projectId}, {roles: req.body}).then(() => {
				res.status(200);
				res.end();
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
			Project.findOne({_id: req.params.projectId, roles: {members: req.user._id, isManager: true}}, {name: 1}).then(isPermitted => {
				if(isPermitted) {
					Project.findOneAndUpdate({_id: req.params.projectId}, {roles: req.body}).then(() => {
						res.status(200);
						res.end();
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
					res.status(403);
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
		}
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
			let newIssue = new Issue({
				projectId: req.params.projectId,
				title: req.body.title,
				description: (req.body.description) ? req.body.description : "",
				checklist: req.body.checklist,
				files: files,
				author: req.user._id
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
			res.end();
		}
	} catch (e) {
		File.clearTempFiles(req.files);
		next(e);
	}
});

// endpoint for attach files to issue when edit
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
			res.end();
		}
	} catch (e) {
		File.clearTempFiles(req.files);
		next(e);
	}
});

// endpoint for get attachment file
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
				res.header('Content-Disposition', `attachment; filename="${file.filename}"`);
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
			res.end()
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
			res.end()
		}
	} catch (e) {
		next(e);
	}
});

router.patch('/:projectId/issues/:issueId', [validator.checkBody('newIssue'), validator.checkParamsForObjectIds()],  async function (req, res, next) {
	try {
		if((await Project.checkEditorPermission(req.params.projectId, req.user._id, req.user.isAdmin))) {
			let matchedIssuesCount = (await Issue.updateOne({_id: ObjectId(req.params.issueId), projectId: ObjectId(req.params.projectId)}, {
				title: req.body.title,
				description: (req.body.description) ? req.body.description : "",
				checklist: req.body.checklist,
				author: req.user._id
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
			res.end();
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
			res.end()
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
				$pull: { files: ObjectId(req.params.fileId) }
			})).nModified;
			if(issueModifiedCount=== 0) {
				res.status(404);
				res.end();
			}
			else {
				File.deleteById(ObjectId(req.params.fileId));
				websocketService.emitUpdatedIssue(req.params.issueId, req.params.projectId);
				res.status(200);
				res.end();
			}
		} else {
			res.status(403);
			res.end()
		}
	} catch (e) {
		next(e);
	}
});

router.post('/:projectId/issues/move', [validator.checkBody('moveOperation'), validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		let originalColumn = await Project.checkMovePermission(req.params.projectId, req.user._id, req.body, req.user.isAdmin);
		if (originalColumn !== req.body.targetColumn) {
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
			let detach = Project.findOneAndUpdate({
				_id: req.params.projectId,
				"columns.id": originalColumn
			}, {
				$pull: {
					"columns.$.issues": req.body.issueId
				}
			});
			let attach = Project.findOneAndUpdate({
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
			res.end()
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
			res.end();
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

			let newHotfix = new Hotfix({
				title: req.body.title,
				description: req.body.description,
				priority: req.body.priority,
				state: 1,
				created: Date.now(),
				files: files,
				project: ObjectId(req.params.projectId),
				author: ObjectId(req.user._id)
			});
			await newHotfix.save();
			res.status(200);
			res.end();
		} else {
			File.clearTempFiles(req.files);
			res.status(403);
			res.end();
		}
	} catch (e) {
		next(e);
	}
})

router.patch('/:projectId/hotfixes/:hotfixId', [validator.checkBody('hotfix'), validator.checkParamsForObjectIds()],  async function (req, res, next) {
	try {
		let projectPermissionQueries = await Promise.all([
			Hotfix.validateProjectIdAndHotfixId(req.params.projectId, req.params.hotfixId),
			Project.checkEditHotfixesPermission(req.params.projectId, req.user._id, req.user.isAdmin)]);
		if((projectPermissionQueries[0] && projectPermissionQueries[1])) {
			await Hotfix.findByIdAndUpdate(req.params.hotfixId, {
				title: req.body.title,
				description: (req.body.description) ? req.body.description : "",
				priority: req.body.priority,
				state: req.body.state,
				author: req.user._id
			});
			// websocketService.emitUpdatedIssue(req.params.issueId, req.params.projectId);
			res.status(200);
			res.end();
		} else {
			res.status(403);
			res.end();
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
				websocketService.emitUpdatedIssue(req.params.hotfixId, req.params.projectId);
			}
			res.json(files);
		}
		else{
			File.clearTempFiles(req.files);
			res.status(403);
			res.end();
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
				$pull: { files: ObjectId(req.params.fileId) }
			}));
			if(modified.nModified === 0) {
				res.status(404);
				res.end();
			}
			else {
				File.deleteById(ObjectId(req.params.fileId));
				res.status(200);
				res.end();
			}
		}
	}catch (e) {
		File.deleteById(ObjectId(req.params.fileId));
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
			//websocketService.emitDeletedIssue(req.params.issueId, req.params.projectId);
			res.status(200);
			res.end();
		}else{
			res.status(403);
			res.end();
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
				res.header('Content-Disposition', `attachment; filename="${file.filename}"`);
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
			res.end();
		}
	}catch (e) {
		next(e);
	}
})

router.get('/:projectId/hotfixes', [validator.checkParamsForObjectIds(), validator.checkQuery('getHotfixesQuery')], 
	async function (req, res, next) {
	try {
		if (await Project.checkReaderPermission(req.params.projectId, req.user._id, req.user.isAdmin)) {
			let limit = parseInt(req.query.limit) || 10;
			let page = parseInt(req.query.page) || 1;
			let sortingParams = {
				priority: -1,
				state: 1,
				created: -1
			};
			// let translation = {
			// 	'ASC': 1,
			// 	'DESC': -1
			// }
			// if (req.query.sortByState) {
			// 	sortingParams.state = translation[req.query.sortByState];
			// }
			// if (req.query.sortByPriority) {
			// 	sortingParams.priority = translation[req.query.sortByPriority];
			// }
			// if (req.query.sortByCreation) {
			// 	sortingParams.creation = translation[req.query.sortByCreation];
			// }
			let query;
			if (req.query ? req.query.showCompleted : false) {
				query = await Promise.all([
					Hotfix.find({project: req.params.projectId, state: {$gte : 3}}).sort(sortingParams).skip((page - 1) * limit).limit(limit),
					Hotfix.find({project: req.params.projectId, state: {$gte : 3}}).sort(sortingParams).skip((page - 1) * limit).limit(limit).count()
				]);
			} else {
				query = await Promise.all([
					Hotfix.find({project: req.params.projectId, state: {$lt: 3}})
						.sort(sortingParams).skip((page - 1) * limit)
						.limit(limit)
						.populate('files', 'filename length'),
					Hotfix.find({project: req.params.projectId, state: {$gte : 3}}).sort(sortingParams).skip((page - 1) * limit).limit(limit).count()
				]);
			}
			res.json({
				total: query[1],
				pageCount: Math.ceil(query[1] / limit),
				data: query[0]
			});
		} else {
			res.status(403);
			res.end();
		}
	} catch (e) {
		next(e);
	}
});



module.exports = router;