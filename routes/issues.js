const router = require('express').Router();
const passport = require('passport');
const validator = require('../utils/validation/validator');
const Project = require('../models/project');
const Issue = require('../models/issue');

// router.put('/', [validator.checkBody('newIssue')], async function (req, res) {
// 	if(await Project.checkCreatorPermission(req.body.project, req.user._id)) {
// 		let newIssue = new Issue({
//
// 		});
// 	} else {
// 		res.status(403);
// 		res.end();
// 	}
// });