/* jshint node:true */
var mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    Package = mongoose.model('Package');

module.exports = function (req, res, next) {

    Account.findById(req.user.id, 'alerts', function (err, result) {
        if (err) {
            return next(err);
        }

        Package.find({
            _id: {
                $in: result.alerts || []
            }
        }, null, {
            sort: {
                'name': 1
            }
        }, function (err, packages) {
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
};