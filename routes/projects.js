const router = require('express').Router();
const passport = require('passport');
const validator = require('../utils/validation/validator');
const Project = require('../models/project');

router.put('/', [passport.authenticate('jwt', {session: false}), validator.check('newProfile')],  function (req, res) {
	if(req.user.isAdmin) {
		res.status(200);
		res.end();
	} else {
		res.status(403);
		res.end();
	}
});

module.exports = router;