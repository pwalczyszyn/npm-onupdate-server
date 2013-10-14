/* jshint node:true*/
var mongoose = require('mongoose');

module.exports = function () {

    var AccountSchema = new mongoose.Schema({

        email: {
            type: String,
            required: true,
            unique: true
        },

        active: {
            type: Boolean,
            default: false
        },

        activationCode: String,

        pwdHash: String,

        newPwdCode: String,

        accessToken: String

    });

    AccountSchema.static('findByAccessToken', function (token, callback) {
        this.findOne({
            accessToken: token
        }, callback);
    });

    AccountSchema.static('findByEmail', function (email, callback) {
        this.findOne({
            email: email
        }, callback);
    });

    return AccountSchema;
};