/* jshint node: true */
var passport = require('passport'),
    routes = require('../server/routes');

module.exports = function (app) {

    app.post('/api/v1/register', routes.apiv1.register);
    app.post('/api/v1/authenticate', routes.apiv1.authenticate);

    app.get('/api/v1/checktoken', passport.authenticate('bearer', {
        session: false
    }), routes.apiv1.checktoken);

    app.get('/api/v1/alerts', passport.authenticate('bearer', {
        session: false
    }), routes.apiv1.alerts.list);
    
    app.post('/api/v1/alerts', passport.authenticate('bearer', {
        session: false
    }), routes.apiv1.alerts.add);

};