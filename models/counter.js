const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;

const counterSchema = new Schema({
    sequenceCount: {
        type: Number,
        required: true
    }
},
{
    capped: {
        size: 1024,
        max: 1
    }
});

const Counter = mongoose.model('Counter', counterSchema, 'counter');
module.exports = Counter;