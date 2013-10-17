/* jshint node: true */

var express = require('express'),
    http = require('http'),
    app = module.exports = express();

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

// Start the server
http.createServer(app).listen(app.get('port'), app.get('ip'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

// Start npm monitoring service
require('./server/monitors').npm.start(function (err) {
    if (err) {
        // TODO: send email to admin
        return console.log('Error starting npm monitoring service: %s\n%s', err.message, err.stack);
    }
    console.log('npm monitor started');
});