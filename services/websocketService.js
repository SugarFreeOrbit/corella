const User = require('../models/user');
const jwt = require('jsonwebtoken');

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
	this.authenticate = async (socket, next) => {
		try {
			let rawJwt = socket.request.headers['x-client'].split(' ')[1];
			await jwt.verify(rawJwt, CONFIG.secret);
			let parsedJwt = jwt.decode(rawJwt);
			let user = await User.findById(parsedJwt.id);
			if (user) {
				logger.log('debug', `User ${parsedJwt.id} connected to socket`);
				next();
			} else {
				next(new Error('Unauthenticated'));
			}
		} catch (e) {
			next(new Error('Unauthenticated'));
		}
	}
	this.boardEventSocket = this.server.of('/boardEvents');
	this.boardEventSocket.use(this.authenticate);
	this.hotfixEventSocket = this.server.of('/hotfixEvents');
	this.hotfixEventSocket.use(this.authenticate);

	this.emitNewIssue = function (issueId, projectId) {
		this.boardEventSocket.emit('newIssue', {issueId, projectId});
	};

	this.emitDeletedIssue = function (issueId, projectId) {
		this.boardEventSocket.emit('deletedIssue', {issueId, projectId});
	};

	this.emitUpdatedIssue = function (issueId, projectId) {
		this.boardEventSocket.emit('updatedIssue', {issueId, projectId});
	};

	this.emitMovedIssue = function (moveOperation, projectId) {
		this.boardEventSocket.emit('movedIssue', {moveOperation, projectId});
	};

	this.emitNewHotfix = function(hotfixId, projectId) {
		this.hotfixEventSocket.emit('newHotfix', {hotfixId, projectId});
	}

	this.emitDeletedHotfix = function(hotfixId, projectId) {
		this.hotfixEventSocket.emit('deletedHotfix', {hotfixId, projectId});
	}

	this.emitUpdatedHotfix = function(hotfixId, projectId) {
		this.hotfixEventSocket.emit('updatedHotfix', {hotfixId, projectId});
	}
};

module.exports =  new WebsocketService();