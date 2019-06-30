const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('./utils/loggerConfig');
global.logger = logger;

const app = express();

//Init global db connection
const dbUser = 'corellaAdmin';
const dbPwd = 'bc5a6b33b659af8e426cdd4a141beaf33';
const dbHost = '63.142.250.14';
const dbName = 'corella';
mongoose.connect(`mongodb://${dbUser}:${dbPwd}@${dbHost}/${dbName}`).catch(err => {
	logger.error('Failed to connect to db!');
}).then(() => {
	logger.log('info', 'Connected to database!');
});

const usersRouter = require('./routes/users');

app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined", { stream: logger.stream }));
app.use('/users', usersRouter);
app.listen(8080);