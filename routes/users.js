const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const validator = require('../utils/validation/validator');
const emailValidator = require("email-validator");

router.put('/', [validator.checkBody('newUser')], function (req, res) {
	if (req.user.isAdmin && emailValidator.validate(req.body.email)) {
		bcrypt.hash(req.body.password, 10).then(hash => {
			let newUser = new User({
				username: req.body.username,
				password: hash,
				isAdmin: req.body.isAdmin,
				email: req.body.email
			});
			newUser.save().then(() => {
				res.status(201);
				res.end();
				newUser.setAvatar().then(() => {
					logger.debug('Avatar generated');
				}).catch(err => {
					logger.error(err.message);
				});
			}).catch(err => {
				res.status(400);
				res.json({message: err.message});
			});
		}).catch(err => {
			logger.error(err.message);
			res.status(500);
			res.end();
		});
	}
	else {
		res.status(403);
		res.end();
	}
});

router.get('/',[validator.checkQuery('paginationQuery')], async function (req, res, next) {
	if (req.user.isAdmin) {
		try {
			let limit = parseInt(req.query.limit) || 10;
			let page = parseInt(req.query.page) || 1;
			let query = await Promise.all([
				User.find({}, {username: 1, email: 1, isAdmin: 1}).skip((page - 1) * limit).limit(limit),
				User.estimatedDocumentCount()
			]);
			res.json({
				total: query[1],
				pageCount: Math.ceil(query[1] / limit),
				data: query[0]
			});
		} catch (e) {
			next(e);
		}
	}
	else {
		res.status(403);
		res.end();
	}
});

router.get('/:userId', [validator.checkParamsForObjectIds()], async function (req, res, next) {
	if (req.user.isAdmin) {
		try {
			let user = await User.findById(req.params.userId, {username: 1});
			if (!user) {
				res.status(404);
				res.end();
			}
			else {
				res.json(user)
			}
		} catch (e) {
			next(e)
		}
	}
	else {
		res.status(403);
		res.end();
	}
});

router.delete('/:userId', [validator.checkParamsForObjectIds()], function (req, res) {
	if(req.user.isAdmin) {
		User.deleteOne({_id: req.params.userId}).then((result) => {
			if (result.n < 1) {
				res.status(404);
			}
			else {
				res.status(200);
			}
			res.end();
		}).catch(err => {
			res.status(400);
			res.json({message: err.message});
		});
	} else {
		res.status(403);
		res.end();
	}
});

router.patch('/:userId', [validator.checkParamsForObjectIds(), validator.checkBody('updateUser')], function (req, res) {
	if(req.user.isAdmin) {
		let update = req.body;
		if(update._id) {
			delete update._id;
		}
		if (update.password) {
			update.password = bcrypt.hashSync(update.password, 10);
		}
		User.updateOne({_id: req.params.userId}, update).then((result) => {
			if (result.n < 1) {
				res.status(404);
			}
			else {
				res.status(200);
			}
			res.end();
		}).catch(err => {
			res.status(400);
			res.json({message: err.message});
		});
	} else {
		res.status(403);
		res.end();
	}
});

router.get('/:userId/avatar', [validator.checkParamsForObjectIds()], async function (req, res) {
	try {
		let downloadStream = await User.downloadAvatarByUserId(req.params.userId);
		downloadStream.on('file', file => {
			res.type(file.contentType || 'image/png');
		});
		downloadStream.on('data', chunk => {
			res.write(chunk);
		});
		downloadStream.on('end', () => {
			res.end();
		});
	} catch (err) {
		if(err.name === 'CastError') {
			res.status(404);
			res.end();
		} else {
			res.status(500);
			res.end();
		}
	}
});

module.exports = router;