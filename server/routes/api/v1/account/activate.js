/* jshint node:true */

var mongoose = require('mongoose'),
    Account = mongoose.model('Account');

module.exports = function (req, res, next) {

    var activationCode = req.params.activationCode;

    Account.findOneAndUpdate({
        activationCode: activationCode,
        active: false
    }, {
        active: true,
        $unset: {
            activationCode: ''
        }
    }, function (err, account) {
        if (err) {
            return next(err);
        }

        if (!account) {
            console.log('Trying to activate not existing account, activationCode:', activationCode);
        }

        res.render('account/activate');
    });

};