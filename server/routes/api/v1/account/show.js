/* jshint node:true */
var mongoose = require('mongoose'),
    Account = mongoose.model('Account');

module.exports = function (req, res, next) {

    Account.findById(req.user.id, function (err, account) {
        if (err) {
            return next(err);
        }
        if (!account) {
            return next(new Error('Account not found!'));
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(JSON.stringify({
            email: account.email,
            active: account.active,
            alertsCount: account.alerts.length
        }));
        res.end();
    });
};