/* jshint node: true */
var path = require('path'),
    express = require('express'),
    expressValidator = require('express-validator');

module.exports = function (app) {

    // all environments
    app.set('views', path.join(__dirname, '../server/views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, '../client/static')));
//    app.use(express.favicon());
    app.use(express.json()).use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(expressValidator());
    app.use(express.logger('dev'));
    app.use(app.router);

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

};