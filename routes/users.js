const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

User.findOneAndUpdate({username: "superadmin"}, {
	username: CONFIG.superadmin.username,
	password: CONFIG.superadmin.password,
	email: CONFIG.superadmin.email
}, {upsert: true}).then(() => {
	logger.log('debug', 'Assured superadmin user')
});

module.exports = router;