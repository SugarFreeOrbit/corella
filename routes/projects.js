const router = require('express').Router();
const passport = require('passport');
const validator = require('../utils/validation/validator');
const Project = require('../models/project');

router.put('/', [validator.checkBody('newProject')],  function (req, res) {
	if(req.user.isAdmin) {
		let newProject = new Project({
			name: req.body.name,
			roles: req.body.roles,
			columns: req.body.columns,
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

router.patch('/:projectId/roles', [validator.checkBody('roles'), validator.checkParamsForObjectIds()], function (req, res, next) {
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
});

router.get('/:projectId/columns', async function (req, res) {
	if(await Project.checkReaderPermission(req.params.projectId, req.user._id) || req.user.isAdmin) {
		let project = await Project.findById(req.params.projectId, {
			columns: 1
		});
		await project.populate({
			path: 'columns.issues',
			select: 'title'
		}).execPopulate();
		res.json(project);
	} else {
		res.status(403);
		res.end()
	}
});

module.exports = router;