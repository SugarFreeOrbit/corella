const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;


const boardSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	isClosing: {
		type: Boolean,
		required: true
	},
	issues:[{
		type: ObjectId
	}],
	isStarting: {
		type: Boolean,
		required: true
	}
});

const Board = mongoose.model('Board', boardSchema, 'boards');
module.exports = {Board, boardSchema};