/* jshint node:true*/
var mongoose = require('mongoose');

module.exports = function () {

    var AccountSchema = new mongoose.Schema({

        email: {
            type: String,
            default: ''
        },

        activationCode: {
            type: String,
            default: null
        },

        active: {
            type: Boolean,
            default: false
        },

        pwdHash: {
            type: String,
            default: null
        },

        newPwdCode: {
            type: String,
            default: null
        }

    });

    return AccountSchema;
};