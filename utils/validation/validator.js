//TODO: Consider using AJV
const Validator = require('jsonschema').Validator;
//const Validator = require('ajv');
const validationSchemas = require('./validationSchemas');

const validator = function () {
	this.v = new Validator();
	this.check = ((schema) => {
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