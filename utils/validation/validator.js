//TODO: Consider using AJV
const Validator = require('jsonschema').Validator;
//const Validator = require('ajv');
const validationSchemas = require('./validationSchemas');

Validator.prototype.customFormats.objectId = function(input) {
	return (/^[a-z0-9]+$/i.test(input) && input.length !== 24);
};

const validator = function () {
	this.v = new Validator();
	this.checkBody = ((schema) => {
		return ((req, res, next) => {
			let validationResult = this.v.validate(req.body, validationSchemas[schema]);
			if (validationResult.errors.length) {
				res.status(400);
				res.end();
			} else {
				next();
			}
		})
	})
};

module.exports = new validator();