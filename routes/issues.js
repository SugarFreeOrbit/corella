const router = require('express').Router();
const passport = require('passport');
const validator = require('../utils/validation/validator');
const Project = require('../models/project');
const Issue = require('../models/issue');

router.put('/', [validator.checkBody('newIssue')], async function (req, res) {
	if(await Project.checkCreatorPermission(req.body.project, req.user._id)) {
		let newIssue = new Issue({
			title: req.body.title,
			description: req.body.description,
			checklist: req.body.checklist
		});
		let appendIssueToProject = Project.findByIdAndUpdate(req.body.project, {
			$push: {
				issues: newIssue._id
			}
		});
		await Promise.all([newIssue.save(), appendIssueToProject]);
		req.status(201);
		res.end();
	} else {
		res.status(403);
		res.end();
	}
});

module.exports = router;