const Validator = require('jsonschema').Validator;
const validationSchemas = require('./validationSchemas');

const validator = function () {
	this.v = new Validator();
	this.check = ((schema) => {
		return ((req, res, next) => {
			let validationResult = this.v.validate(req.body, validationSchemas[schema]);
			if (validationResult.errors) {
				res.status(400);
				res.end();
			} else {
				next();
			}
		})
	})
};

module.exports = new validator();