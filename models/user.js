const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const GridFsBucket = require('mongodb').GridFSBucket;
const ObjectId = require('mongoose').Schema.Types.ObjectId;
const ReadableStream = require('stream').Readable;
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
userSchema.methods.setAvatar = async function (avatar, size=200, contentType='image/png', filename='avatar.png') {
	let readableStream = new ReadableStream();
	let newAvatar;
	if(!avatar) {
		newAvatar = generateRandomAvatar(this.username, size);
	} else {
		newAvatar = avatar;
	}
	readableStream.push(newAvatar);
	readableStream.push(null);
	let bucket = new GridFsBucket(mongoose.connection.db, {
		bucketName: 'avatars'
	});
	let uploadStream = bucket.openUploadStream(filename, {contentType});
	readableStream.pipe(uploadStream);
	uploadStream.on('finish', async () => {
		this.avatar = uploadStream.id;
		await this.save();
	});
};
userSchema.statics.downloadAvatarByUserId = async function (id) {
	let readableStream = new ReadableStream();
	let user = await this.findById(id, {avatar: 1});
	let bucket = new GridFsBucket(mongoose.connection.db, {
		bucketName: 'avatars'
	});
	return bucket.openDownloadStream(user.avatar);
};

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;