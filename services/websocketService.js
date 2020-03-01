const User = require('../models/user');

const WebsocketService = function () {
	this.server = require('socket.io')(HTTP_SERVER);
	this.boardEventSocket = this.server.of('/boardEvents');
	this.boardEventSocket.use((socket, next) => {
		console.log(socket.request.headers);
		next();
	});
	this.emitNewIssue = function (issueId, projectId) {
		this.boardEventSocket.to(projectId).emit('newIssue', {issueId});
	};
};

module.exports =  new WebsocketService();