//Require npm dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const passport = require('passport');
const http = require('http');

//Load and export the logger configuration
const logger = require('./utils/loggerConfig');
global.logger = logger;

//Load main configuration file
global.CONFIG = require('./configuration');

//Initialize the express instance
const app = express();

//Create server instance and pass it to globals
const server = http.createServer(app);
global.HTTP_SERVER = server;

//Require and attach JWT parsing middleware
const jwtStrategy = require('./security/jwtStrategy');
passport.use(jwtStrategy);

//Assure superadmin user
// const User = require('./models/user');
// bcrypt.hash(CONFIG.superadmin.password, 10).then(hash => {
// 	User.findOneAndUpdate({username: "superadmin"}, {
// 		username: "superadmin",
// 		password: hash,
// 		email: CONFIG.superadmin.email,
// 		isAdmin: true
// 	}, {upsert: true}).then(() => {
// 		logger.log('debug', 'Assured superadmin user')
// 	});
// });

app.use(cors());

//Initialize routes
const usersRouter = require('./routes/users');
const indexRouter = require('./routes/index');
const projectsRouter = require('./routes/projects');
// const issuesRouter = require('./routes/issues');

//Add middleware and start the HTTP listener
app.use(bodyParser.json());

app.use(morgan("combined", { stream: logger.stream }));
app.use('/users', passport.authenticate('jwt', {session: false}), usersRouter);
app.use('/projects', passport.authenticate('jwt', {session: false}), projectsRouter);
// app.use('/issues', passport.authenticate('jwt', {session: false}), issuesRouter);
app.use('/', indexRouter);
app.use(function (err, req, res, next) {
	if(err.name === 'ValidationError' || err.name === 'CastError') {
		res.status(400);
		res.json(err.message);
	} else {
		res.status(500);
		res.json({message: err.message});
		logger.error(err.stack);
	}
});

//Init global db connection and start HTTP listener
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
const dbUser = CONFIG.mongodb.user;
const dbPwd = CONFIG.mongodb.pwd;
const dbHost = CONFIG.mongodb.host;
const dbName = CONFIG.mongodb.dbName;
let dbConnPromise = mongoose.connect(dbPwd && dbHost ? `mongodb+srv://${dbUser}:${dbPwd}@${dbHost}/${dbName}` : `mongodb://${dbHost}/${dbName}`);
dbConnPromise.then((db) => {
	logger.log('info', 'Connected to database!');
	bcrypt.hash(CONFIG.superadmin.password, 10).then(hash => {
		mongoose.connection.db.collection('users').findOneAndUpdate({username: "superadmin"}, {$set: {
				username: "superadmin",
				password: hash,
				email: CONFIG.superadmin.email,
				isAdmin: true
			}}, {upsert: true}).then((superUser) => {
			global.CONFIG.superadmin.id = superUser.value._id;
			logger.log('info', 'Assured superadmin user')
		});
	});
	server.listen(CONFIG.server.port);
	logger.info(`App is listening on port ${server.address().port}!`);
});
dbConnPromise.catch((err) => {
	logger.error(`Failed to connect to db! Error: ${err.message}`);
});
