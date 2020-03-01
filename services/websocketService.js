const User = require('../models/user');

const WebsocketService = function () {
	this.server = require('socket.io')(HTTP_SERVER, {
		handlePreflightRequest: (req, res) => {
			const headers = {
				"Access-Control-Allow-Headers": "Content-Type, X-Client",
				"Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
				"Access-Control-Allow-Credentials": true
			};
			res.writeHead(200, headers);
			res.end();
		}
	});
	this.boardEventSocket = this.server.of('/boardEvents');
	this.boardEventSocket.use((socket, next) => {
		next();
	});
	this.emitNewIssue = function (issueId, projectId) {
		this.boardEventSocket.to(projectId).emit('newIssue', {issueId});
	};
};

module.exports =  new WebsocketService();