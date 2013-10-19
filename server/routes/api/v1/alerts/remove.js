/* jshint node:true */
var util = require('util'),
    mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    Package = mongoose.model('Package');

module.exports = function (req, res, next) {
    Account.findById(req.user.id, 'alerts', function (err, account) {
        if (err) {
            return next(err);
        }
        if (!account) {
            return next(new Error('Account not found!'));
        }

        var names = util.isArray(req.body.packages) ? req.body.packages : [req.body.packages];
        Package.findByNames(names, function (err, packages) {
            if (err) {
                return next(err);
            }

            packages.forEach(function (package) {
                account.alerts.splice(account.alerts.indexOf(package._id), 1);
            });

            account.save(function (err) {
                if (err) {
                    return next(err);
                }

                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write(JSON.stringify(packages));
                res.end();
            });
        });
    });
};