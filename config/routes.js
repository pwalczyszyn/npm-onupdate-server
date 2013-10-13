/* jshint node: true */
var routes = require('../server/routes');

module.exports = function (app) {

    app.get('/api/v1/login', routes.apiv1.login);

};