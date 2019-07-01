const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.post('/login', function (res, req) {
	if (req.username && req.password) {
		User.findOne({
			$or: [
				{
					username: req.username
				},
				{
					email: req.username
				}
			]
		}).then(user => {
			if(user) {
				bcrypt.compare(req.password, user.password).then(res => {
					if (res) {
						jwt.sign({id: user.id}, CONFIG.secret, { expiresIn: 7200 }, function (token, err) {
							if (err) {
								logger.error(err.toString());
								res.end({jwt: token});
							}
						})
					} else {
						res.status(401);
						res.end();
					}
				})
			} else {
				res.status(401);
				res.end();
			}
		});
	} else {
		res.status(401);
		res.end();
	}
});

module.exports = router;