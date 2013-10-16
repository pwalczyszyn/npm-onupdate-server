/* jshint node: true */
var mongoose = require('mongoose'),
    mongooseTypes = require('mongoose-types');

// Adding additional types
mongooseTypes.loadTypes(mongoose);

var AccountSchema = require('../server/models/account')();
mongoose.model('Account', AccountSchema);

var PackageSchema = require('../server/models/package')();
mongoose.model('Package', PackageSchema);

var MonitorSchema = require('../server/models/monitor')();
mongoose.model('Monitor', MonitorSchema);