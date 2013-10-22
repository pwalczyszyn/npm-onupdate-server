/* jshint node:true*/
var mongoose = require('mongoose');

module.exports = function () {

    var AccountSchema = new mongoose.Schema({

        email: {
            type: String, // mongoose.SchemaTypes.Email, - it's to restrictive doesn't allow + sign
            required: true,
            unique: true
        },

        active: {
            type: Boolean,
            default: false
        },

        activationCode: String,

        pwdHash: String,
        
        passwordCode: String,

        newPwdCode: String,

        accessToken: String,

        notifiedAt: Date,

        alerts: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Package'
            }]
        });

    AccountSchema.static('findByAccessToken', function (token, callback) {
        this.findOne({
            accessToken: token
        }, callback);
    });
    
    AccountSchema.static('findByPasswordCode', function (passwordCode, callback) {
        this.findOne({
            passwordCode: passwordCode
        }, callback);
    });

    AccountSchema.static('findByEmail', function (email, callback) {
        this.findOne({
            email: email
        }, callback);
    });

    return AccountSchema;
};