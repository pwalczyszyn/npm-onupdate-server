/* jshint node:true */
var util = require('util'),
    mongoose = require('mongoose'),
    Package = mongoose.model('Package'),
    Account = mongoose.model('Account');

module.exports = function (req, res, next) {
    var names = util.isArray(req.body.packages) ? req.body.packages : [req.body.packages];

    Package.findByNames(names, function (err, packages) {

        if (err) {
            return next(err);
        }

        var missing = names.filter(function (name) {
            var available = packages.some(function (package) {
                if (package.name == name) {
                    return true;
                }
            });
            return !available;
        });

        if (missing.length > 0) {
            addMissingPackages(missing, function (err, newPackages) {
                if (err) {
                    return next(err);
                }
                packages.push.apply(packages, newPackages);
                updateAccount();
            });
        } else {
            updateAccount();
        }

        function updateAccount() {
            var ids = packages.map(function (package) {
                return package._id;
            });

            Account.findByIdAndUpdate(req.user.id, {
                $addToSet: {
                    alerts: {
                        $each: ids
                    }
                }
            }, function (err) {
                if (err) {
                    return next(err);
                }
                res.send(200);
            });
        }
    });

};


function addMissingPackages(names, callback) {

    callback(null, []);

}