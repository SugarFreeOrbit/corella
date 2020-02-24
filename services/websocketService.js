const WebsocketService = function () {
	this.server = require('socket.io')(HTTP_SERVER);
	this.boardEventSocket = this.server.of('/boardEvents');
	this.emitNewIssue = function (issueId, projectId) {
		this.boardEventSocket.to(projectId).emit('newIssue', {issueId});
	};
};

module.exports =  new WebsocketService();