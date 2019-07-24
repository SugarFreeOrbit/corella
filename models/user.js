const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const generateRandomAvatar = require('../utils/randomAvatars');

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
	},
	avatar: {
		type: ObjectId
	}
});
// TODO: Figure out how to protect superadmin on model level
// userSchema.pre('save', function (next) {
// 	if(this.id === CONFIG.superadmin.id) {
// 		next(new Error('Operations on the superadmin user are prohibited'));
// 	} else {
// 		next();
// 	}
// });
// userSchema.pre('deleteOne', function (next) {
// 	console.log(this);
// 	if(this.id === CONFIG.superadmin.id) {
// 		next(new Error('Operations on the superadmin user are prohibited'));
// 	} else {
// 		next();
// 	}
// });
userSchema.post('save', function (err, doc, next) {
	if (err.code === 11000) {
		next(new Error('User already exists'));
	} else {
		next();
	}
});
 userSchema.pre('save', function (next) {
 	if(!this.avatar) {

 	}
 });

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;