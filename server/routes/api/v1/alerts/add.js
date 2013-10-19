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
                added = [],
                errors = [];

            packages.forEach(function (item) {
                if (item instanceof Package) {
                    ids.push(item._id);
                    added.push(item);
                } else {
                    errors.push(item);
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
                    added: added,
                    errors: errors
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
                    return callback(null, {
                        packageName: name,
                        message: err.message
                    });
                }
                if (response.statusCode != 200) {
                    return callback(null, {
                        packageName: name,
                        statusCode: response.statusCode,
                        message: body.reason
                    });
                }

                var package = new Package(),
                    version = body['dist-tags'].latest,
                    latest = body.versions ? body.versions[version] : null;

                package.name = body.name;
                package.version = version;
                package.updatedAt = new Date(0);
                package.description = latest ? latest.description : null;
                package.homepage = latest ? latest.homepage || latest.url || 'https://npmjs.org/package/' + name : null;

                package.save(function (err, savedPackage) {
                    if (err) {
                        return callback(null, {
                            packageName: name,
                            message: err.message
                        });
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