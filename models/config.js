const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const configSchema = new Schema({
    allowedFileTypes: [String]
});

const Config = mongoose.model('Config', configSchema, 'globalConfig');

module.exports = Config;