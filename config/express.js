/* jshint node: true */
var path = require('path'),
    express = require('express');

module.exports = function (app) {

    // all environments
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, '../server/views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, '../client/static')));
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

};