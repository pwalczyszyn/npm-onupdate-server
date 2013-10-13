/* jshint node: true */

var mongoose = require('mongoose'),
    AccountSchema = require('../server/models/account')();

mongoose.model('Account', AccountSchema);