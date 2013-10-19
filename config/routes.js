/* jshint node: true */
var passport = require('passport'),
    routes = require('../server/routes');

module.exports = function (app) {

    app.get('/', routes.public.home);

    app.get('/account/activate/:activationCode', routes.apiv1.account.activate);
    app.post('/api/v1/account/register', routes.apiv1.account.register);
    app.post('/api/v1/account/authenticate', routes.apiv1.account.authenticate);

    app.get('/api/v1/checktoken', authenticated(), routes.apiv1.checktoken);

    app.get('/api/v1/alerts', authenticated(), routes.apiv1.alerts.list);
    app.post('/api/v1/alerts', authenticated(), routes.apiv1.alerts.add);
    app.delete('/api/v1/alerts', authenticated(), routes.apiv1.alerts.remove);

};

function authenticated() {
    return passport.authenticate('bearer', {
        session: false
    });
}