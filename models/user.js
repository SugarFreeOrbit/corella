const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const userSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: [true, 'Username is required']
	},
	email: {
		type: String,
		unique: true,
		required: [true, 'E-mail is required']
	},
	password: {
		type: String,
		required: [true, 'Password is required']
	},
	isAdmin: {
		type: Boolean,
		required: [true, 'Type is required']
	}
});
userSchema.pre('save', function (next) {
	if(this.id === CONFIG.superadmin.id) {
		next(new Error('Operations on the superadmin user are prohibited'));
	} else {
		next();
	}
});
userSchema.pre('remove', {document: true, query: false}, function (next) {
	if(this.id === CONFIG.superadmin.id) {
		next(new Error('Operations on the superadmin user are prohibited'));
	} else {
		next();
	}
});
userSchema.post('save', function (err, doc, next) {
	if (err.code === 11000) {
		next(new Error('User already exists'));
	} else {
		next();
	}
});

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;