const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

router.post('/login', function (req, res) {
	if (req.body.username && req.body.password) {
		User.findOne({
			$or: [
				{
					username: req.body.username
				},
				{
					email: req.body.username
				}
			]
		}).then(user => {
			if(user) {
				bcrypt.compare(req.body.password, user.password).then(isEqual => {
					if (isEqual) {
						jwt.sign({id: user.id}, CONFIG.secret, { expiresIn: 7200 }, function (err, token) {
							if (err) {
								res.status(500);
								res.end();
							} else {
								res.json({
									jwt: token,
									username: user.username,
									isAdmin: user.isAdmin
								});
							}
						});
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

router.get('/refresh-token', passport.authenticate('jwt'), async function (req, res, next) {
	jwt.sign({id: req.user._id}, CONFIG.secret, { expiresIn: 7200 }, function (err, token) {
		if (err) {
			res.status(500);
			res.end();
		} else {
			res.json({jwt: token, user: req.user});
		}
	})
});

module.exports = router;