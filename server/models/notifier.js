/* jshint node:true*/
var mongoose = require('mongoose');

module.exports = function () {

    var NotifierSchema = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },

        lastCheck: Date,

        interval: {
            type: Number,
            required: true
        },

        executeAtStart: Boolean,

        accountsToNotify: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Account'
            }]
        });

    return NotifierSchema;
};