const {check, validationResult} = require('express-validator');

const validationSchemas = function () {
	this.Profile = {
		name: {
			isString: true
		},

	}
};

module.exports = new validationSchemas();