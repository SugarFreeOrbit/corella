const winston = require('winston');

const logger = winston.createLogger({
	transports: [
		new winston.transports.File({
			level: 'info',
			filename: './logs/app.log',
			handleExceptions: true,
			maxsize: 5242880,
			maxFiles: 5,
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.align(),
				winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
			)
		}),
		new winston.transports.Console({
			level: 'debug',
			handleExceptions: true,
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp(),
				winston.format.align(),
				winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
			)
		})
	],
	exitOnError: false
});
logger.stream = {
	write: function(message, encoding){
		logger.info(message.replace(/\n$/, ''));
	}
};

module.exports = logger;