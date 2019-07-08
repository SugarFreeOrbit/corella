//Load main configuration file
global.CONFIG = require('./configuration');
//Require npm dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const passport = require('passport');

//Load miscellaneous utils
const responseMiddleware = require('./utils/responseMiddleware');

//Load and export the logger configuration
const logger = require('./utils/loggerConfig');
global.logger = logger;

//Initialize the express instance
const app = express();

//Init global db connection
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
const dbUser = CONFIG.mongodb.user;
const dbPwd = CONFIG.mongodb.pwd;
const dbHost = CONFIG.mongodb.host;
const dbName = CONFIG.mongodb.dbName;
mongoose.connect(`mongodb://${dbUser}:${dbPwd}@${dbHost}/${dbName}`).then((db) => {
	logger.log('info', 'Connected to database!');
	bcrypt.hash(CONFIG.superadmin.password, 10).then(hash => {
		mongoose.connection.db.collection('users').findOneAndUpdate({username: "superadmin"}, {$set: {
			username: "superadmin",
			password: hash,
			email: CONFIG.superadmin.email,
			isAdmin: true
		}}, {upsert: true}).then((superUser) => {
			console.log(superUser);
			global.CONFIG.superadmin.id = superUser.value._id;
			logger.log('debug', 'Assured superadmin user')
		});
	});
}).catch(err => {
	logger.error('Failed to connect to db!');
});

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

//Initialize routes
const usersRouter = require('./routes/users');
const indexRouter = require('./routes/index');

//Add middleware and start the HTTP listener
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined", { stream: logger.stream }));
app.use('/users', usersRouter);
app.use('/', indexRouter);
app.listen(8080);