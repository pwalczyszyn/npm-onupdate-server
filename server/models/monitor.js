/* jshint node:true*/
var mongoose = require('mongoose');

module.exports = function () {

    var MonitorSchema = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        lastChangeAt: Date
    }, {
        strict: false
    });

    return MonitorSchema;
};