const router = require('express').Router();
const Config = require('../models/config');
const validator = require('../utils/validation/validator');

router.get('/', async function (req, res, next) {
    if (req.user.isAdmin) {
        try {
            config = await Config.findOne({}, { _id: 0, __v: 0 });
            res.json(config);
        } catch (e) {
            next(e);
        }
    } else {
        res.status(403);
        res.end();
    }
});

router.patch('/', [validator.checkBody('globalConfig')], async function (req, res, next) {
    if (req.user.isAdmin) {
        try {
            await new Config({
                allowedFileTypes: req.body.allowedFileTypes
            }).save();
            res.status(200);
            res.end();
        } catch (e) {
            next(e);
        }
    } else {
        res.status(403);
        res.end();
    }
});

module.exports = router;