/* jshint node: true */
var passport = require('passport'),
    routes = require('../server/routes');

module.exports = function (app) {
    app.get('/', render('public/home'));
    app.get('/about', render('public/about'));
    app.get('/docs', render('public/docs'));
    app.get('/policy', render('public/policy'));
    app.get('/terms', render('public/terms'));

    app.get('/account/password', routes.public.account.password.request);
    app.post('/account/password', routes.public.account.password.request);
    app.get('/account/password/:passwordCode', routes.public.account.password.set);
    app.post('/account/password/:passwordCode', routes.public.account.password.set);

    app.get('/account/activate/:activationCode', routes.apiv1.account.activate);
    app.post('/api/v1/account/register', routes.apiv1.account.register);
    app.post('/api/v1/account/authenticate', routes.apiv1.account.authenticate);


    app.get('/api/v1/account/show', authenticated(), routes.apiv1.account.show);
    app.put('/api/v1/account/password', authenticated(), routes.apiv1.account.password);
    app.delete('/api/v1/account/delete', authenticated(), routes.apiv1.account.delete);

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


function render(page) {
    return function (req, res) {
        res.render(page);
    };
}