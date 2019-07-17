const router = require('express').Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const validationChains = require('../utils/validationSchemas');
const Project = require('../models/project');

router.put('/', passport.authenticate('jwt', {sessions: false}),  function (req, res) {
	if(req.user.isAdmin) {
		let newProject = new Project({

		});
	} else {
		res.status(403);
		res.end();
	}
});

module.exports = router;