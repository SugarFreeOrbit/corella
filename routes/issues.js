const router = require('express').Router();
const passport = require('passport');
const validator = require('../utils/validation/validator');
const Project = require('../models/project');

router.put('/', [passport.authenticate('jwt', {session: false}), validator.checkBody('newIssue')], function (req, res) {

});