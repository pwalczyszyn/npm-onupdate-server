/* jshint node: true */

var express = require('express'),
    http = require('http'),
    app = exports.app = express(),
    server = http.createServer(app);

// Set the configurations
require('./config/config')(app);

// Load models
require('./config/models')(app);

// Configure auth
require('./config/auth')(app);

// Configure express
require('./config/express')(app);

// Configure routes
require('./config/routes')(app);

// Starting app background services
require('./config/services')(app);

function start(callback) {
    // Start the server
    server.listen(app.get('port'), app.get('ip'), function () {
        console.log('Express server listening on port ' + app.get('port'));
        if (callback) {
            callback();
        }
    }).on('error', function (err) {
        if (callback) {
            callback(err);
        }
    });
}
// Exporting for test framework to be able to start it
exports.start = start;

function stop(callback) {
    server.close(callback);
}
// Exporting for test framework to be able to start it
exports.stop = stop;

// Starting if doesn't have a parent so it's not a test run
if (!module.parent) {
    start();
}