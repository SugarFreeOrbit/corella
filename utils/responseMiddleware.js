const responseMiddleware = function () {
	this.defaultResponseContentType = function (req, res, next) {
		res.header('Content-Type', 'application/json');
		next();
	}	
};

module.exports = new responseMiddleware();