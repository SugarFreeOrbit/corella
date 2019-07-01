//Load main configuration file
global.CONFIG = require('./configuration');
//Require npm dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

//Load miscellaneous utils
const responseMiddleware = require('./utils/responseMiddleware');

//Load and export the logger configuration
const logger = require('./utils/loggerConfig');
global.logger = logger;

//Initialize the express instance
const app = express();

//Init global db connection
const dbUser = CONFIG.mongodb.user;
const dbPwd = CONFIG.mongodb.pwd;
const dbHost = CONFIG.mongodb.host;
const dbName = CONFIG.mongodb.dbName;
mongoose.connect(`mongodb://${dbUser}:${dbPwd}@${dbHost}/${dbName}`).catch(err => {
	logger.error('Failed to connect to db!');
}).then(() => {
	logger.log('info', 'Connected to database!');
});

//Require and attach JWT parsing middleware
const jwtStrategy = require('./utils/jwtStrategy');
passport.use(jwtStrategy);

//Initialize route
const usersRouter = require('./routes/users');

//Add middleware and start the HTTP listener
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined", { stream: logger.stream }));
app.use(responseMiddleware.defaultResponseContentType());
app.use('/users', usersRouter);
app.listen(8080);