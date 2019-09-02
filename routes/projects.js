const router = require('express').Router();
const validator = require('../utils/validation/validator');
const Project = require('../models/project');
const Issue = require('../models/issue');
const md5 = require('md5');

router.put('/', [validator.checkBody('newProject')],  function (req, res) {
	if(req.user.isAdmin) {
		let preparedColumns = req.body.columns.map(column => {
			column.id = md5(req.body.name + column.name);
			return column;
		});
		let newProject = new Project({
			name: req.body.name,
			columns: preparedColumns,
			isArchived: false
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

router.put('/:projectId/roles', [validator.checkBody('role'), validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		if(req.user.isAdmin) {
			let authorizedProject = await Project.findOne({_id: req.params.projectId}, {name: 1});
			if(authorizedProject) {
				let newRole = req.body;
				newRole.id = md5(authorizedProject.name.toString() + req.body.name);
				await Project.findOneAndUpdate({
					_id: req.params.projectId
				}, {
					$push: {
						roles: newRole
					}
				});
				res.status(201);
				res.end();
			} else {
				res.status(404);
				res.end()
			}
		} else {
			let authorizedProject = await Project.findOne({_id: req.params.projectId, roles: {members: req.user._id, isManager: true}}, {name: 1});
			if(authorizedProject) {
				let newRole = req.body;
				newRole.id = md5(authorizedProject.name.toString() + req.body.name);
				await Project.findOneAndUpdate({
					_id: req.params.projectId
				}, {
					$push: {
						roles: newRole
					}
				});
				res.status(201);
				res.end();
			} else {
				res.status(403);
				res.end()
			}
		}
	} catch (e) {
		next(e);
	}
});

router.delete('/:projectId/roles/:roleId', [validator.checkParamsForObjectIds(['roleId'])], async function (req, res, next) {
	try {
		if(req.user.isAdmin) {
			let authorizedProject = await Project.findOne({_id: req.params.projectId}, {name: 1});
			if(authorizedProject) {
				await Project.findOneAndDelete({
					_id: req.params.projectId,
					"roles.id": req.params.roleId
				}, {
					"roles.$": 1
				});
			} else {
				res.status(404);
				res.end()
			}
		} else {
			let authorizedProject = await Project.findOne({_id: req.params.projectId, roles: {members: req.user._id, isManager: true}}, {name: 1});
			if(authorizedProject) {
				let newRole = req.body;
				newRole.id = md5(authorizedProject.name.toString() + req.body.name);
				await Project.findOneAndUpdate({
					_id: req.params.projectId
				}, {
					$push: {
						roles: newRole
					}
				});
				res.status(201);
				res.end();
			} else {
				res.status(403);
				res.end()
			}
		}
	} catch (e) {
		next(e);
	}
});

// router.patch('/:projectId/roles', [validator.checkBody('roles'), validator.checkParamsForObjectIds()], function (req, res, next) {
// 	if(req.user.isAdmin) {
// 		Project.findOneAndUpdate({_id: req.params.projectId}, {roles: req.body}).then(() => {
// 			res.status(200);
// 			res.end();
// 		}).catch(err => {
// 			logger.debug(err.toString());
// 			if (err.name === 'ValidationError'){
// 				res.status(400);
// 			} else {
// 				res.status(500);
// 			}
// 			res.json(err.message);
// 		});
// 	} else {
// 		Project.findOne({_id: req.params.projectId, roles: {members: req.user._id, isManager: true}}, {name: 1}).then(isPermitted => {
// 			if(isPermitted) {
// 				Project.findOneAndUpdate({_id: req.params.projectId}, {roles: req.body}).then(() => {
// 					res.status(200);
// 					res.end();
// 				}).catch(err => {
// 					logger.debug(err.toString());
// 					if (err.name === 'ValidationError'){
// 						res.status(400);
// 					} else {
// 						res.status(500);
// 					}
// 					res.json(err.message);
// 				});
// 			} else {
// 				res.status(403);
// 				res.end();
// 			}
// 		}).catch(err => {
// 			logger.debug(err.toString());
// 			if (err.name === 'ValidationError'){
// 				res.status(400);
// 			} else {
// 				res.status(500);
// 			}
// 			res.json(err.message);
// 		});
// 	}
// });

//issue manipulations go here
router.put('/:projectId/issues', [validator.checkBody('newIssue'), validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		if(await Project.checkCreatorPermission(req.params.projectId, req.user._id) || req.user.isAdmin) {
			let newIssue = new Issue({
				title: req.body.title,
				description: req.body.description,
				checklist: req.body.checklist
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
			res.status(201);
			res.end();
		} else {
			res.status(403);
			res.end();
		}
	} catch (e) {
		next(e);
	}
});

router.get('/:projectId/columns', async function (req, res) {
	if(await Project.checkReaderPermission(req.params.projectId, req.user._id) || req.user.isAdmin) {
		let project = await Project.findById(req.params.projectId, {
			columns: 1
		});
		project.populate({
			path: "columns",
			select: "name"
		});
		await project.execPopulate();
		res.json(project);
	} else {
		res.status(403);
		res.end()
	}
});

router.post('/:projectId/issues/move', [validator.checkBody('moveOperation'), validator.checkParamsForObjectIds()], async function (req, res, next) {
	try {
		if (req.user.isAdmin || await Project.checkMovePermission(req.params.projectId, req.user._id, req.body)) {

		} else {
			res.status(403);
			res.end()
		}
	} catch (e) {
		next(e);
	}
});

module.exports = router;