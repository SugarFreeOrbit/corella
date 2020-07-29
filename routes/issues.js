const router = require('express').Router();
const validator = require('../utils/validation/validator');
const Project = require('../models/project');
// const Issue = require('../models/issue');

// router.put('/', [validator.checkBody('newIssue')], async function (req, res, next) {
// 	try {
// 		if(await Project.checkCreatorPermission(req.body.project, req.user._id) || req.user.isAdmin) {
// 			let newIssue = {
// 				title: req.body.title,
// 				description: req.body.description,
// 				checklist: req.body.checklist
// 			};
// 			await Project.findOneAndUpdate({
// 				_id: req.body.project,
// 				"columns.isStarting": true
// 			}, {
// 				$push: {
// 					"columns.$.issues": newIssue._id
// 				}
// 			});
// 			res.status(201);
// 			res.end();
// 		} else {
// 			res.status(403);
// 			res.end();
// 		}
// 	} catch (e) {
// 		next(e);
// 	}
// });