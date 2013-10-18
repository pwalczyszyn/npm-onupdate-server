/* jshint node:true */
var util = require('util'),
    async = require('async'),
    request = require('request'),
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
            var ids = [],
                failures = [];

            packages.forEach(function (item) {
                if (item instanceof Error) {
                    failures.push(item.message);
                } else {
                    ids.push(item._id);
                }
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

                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write(JSON.stringify({
                    failures: failures
                }));
                res.end();
            });
        }
    });
};


function addMissingPackages(names, callback) {

    async.map(names, function (name, callback) {
        name = name.trim().toLowerCase();
        if (name !== '') {

            request({
                url: 'http://registry.npmjs.org/' + name,
                json: {}
            }, function (err, response, body) {
                if (err) {
                    return callback(null, new Error(name + ' - ' + err.message));
                }
                if (response.statusCode != 200) {
                    console.log(body);
                    return callback(null, new Error(name + ' - ' + response.statusCode + ': ' + body.reason));
                }

                var package = new Package({
                    name: name,
                    version: body['dist-tags'].latest,
                    updatedAt: new Date()
                }),
                    latest = body.versions[package.get('version')];
                if (latest) {
                    package.description = latest.description;
                    package.homepage = latest.homepage || latest.url || 'https://npmjs.org/package/' + name;
                }

                package.save(function (err, savedPackage) {
                    if (err) {
                        return callback(null, new Error(name + ' - ' + err.message));
                    }
                    callback(null, savedPackage);
                });
            });

        } else {
            callback();
        }
    }, function (err, results) {

        var notNulls = [];
        results.forEach(function (result) {
            if (result) {
                notNulls.push(result);
            }
        });

        callback(null, notNulls);
    });

}