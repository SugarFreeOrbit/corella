const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const userSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

mongoose.c

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;