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

counterSchema.statics.getNextSequenceCount = async function() {
    let document =  await this.findOneAndUpdate({}, {$inc: {sequenceCount: 1}}, {upsert: true, new:true});
    return document.sequenceCount;
};

counterSchema.statics.decSequenceCount = function() {
    this.updateOne({}, {$inc: {sequenceCount: -1}});
}

const Counter = mongoose.model('Counter', counterSchema, 'counter');
module.exports = Counter;