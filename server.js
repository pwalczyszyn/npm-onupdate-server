/* jshint node: true */

var express = require('express'),
    http = require('http'),
    app = express();

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    mongoose = require('mongoose');

// Connect to db
mongoose.connect(config.db);

// Load models
require('./config/models');
require('./config/auth')(app);
require('./config/express')(app);
require('./config/routes')(app);

http.createServer(app).listen(config.port, config.ip, function () {
    console.log('Express server listening on port ' + config.port);
});

require('./server/monitors').npm.start(function (err) {
    if (err) {
        // TODO: send email to admin
        return console.log('Error starting npm monitoring service: %s\n%s', err.message, err.stack);
    }
    console.log('npm monitor started');
});