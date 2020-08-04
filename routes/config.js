const router = require('express').Router();
const Config = require('../models/config');

router.get('/', async function (req, res, next) {
    if (req.user.isAdmin) {
        try {
            config = await Config.findOne();
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
            await Config.findOneAndUpdate({
                allowedFileTypes: req.body.allowedFileTypes
            });
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
