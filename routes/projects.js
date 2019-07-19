const router = require('express').Router();
const passport = require('passport');
const validator = require('../utils/validation/validator');
const Project = require('../models/project');

router.put('/', [passport.authenticate('jwt', {session: false}), validator.check('newProject')],  function (req, res) {
	if(req.user.isAdmin) {
		let newProject = new Project({
			name: req.body.name,
			roles: req.body.roles,
			columns: req.body.columns
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

module.exports = router;