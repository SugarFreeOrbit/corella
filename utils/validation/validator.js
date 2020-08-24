//TODO: Consider using AJV
const Validator = require('jsonschema').Validator;
//const Validator = require('ajv');
const validationSchemas = require('./validationSchemas');

Validator.prototype.customFormats.objectId = function(input) {
	return (/^[a-z0-9]+$/i.test(input) && input.length === 24);
};

const validator = function () {
	this.v = new Validator();
		this.checkBody = ((schema) => {
		return ((req, res, next) => {
			let validationResult = this.v.validate(req.body, validationSchemas[schema]);
			if (validationResult.errors.length) {
				res.status(400);
				res.json(validationResult.errors.map(err => err.message).join('; '));
			} else {
				next();
			}
		})
	});
	this.checkQuery = ((schema) => {
		return ((req, res, next) => {
			let validationResult = this.v.validate(req.query, validationSchemas[schema]);
			if (validationResult.errors.length) {
				res.status(400);
				res.json(validationResult.errors.map(err => err.message).join('; '));
			} else {
				next();
			}
		})
	});
	this.checkParamsForObjectIds = function (excludedParams=[]) {
		return ((req, res, next) => {
			let params = Object.entries(req.params);
			for (let param of params) {
				if(!excludedParams.includes(param[0])) {
					if(!/^[a-z0-9]+$/i.test(param[1]) || param[1].length !== 24) {
						res.status(400);
						return res.end();
					}
				}
			}
			next();
		});
	}
};

module.exports = new validator();