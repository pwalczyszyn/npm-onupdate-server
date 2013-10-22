/* jshint node:true */
var mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    passwordHash = require('password-hash');

module.exports = function (req, res, next) {

    req.checkBody('password', 'Invalid password, 6 to 20 characters required').len(6, 20);

    var errors = req.validationErrors();
    if (errors) {
        return res.send(errors, 400);
    }
    
    Account.findById(req.user.id, function (err, account) {
        if (err) {
            return next(err);
        }
        if (!account) {
            return next(new Error('Account not found!'));
        }
        if (!passwordHash.verify(req.body.password, account.pwdHash)) {
            return res.send([{
                    param: 'password',
                    msg: 'Wrong password!'
                }], 400);
        }

        account.remove(function (err) {
            if (err) {
                return next(err);
            }
            res.send(200);
        });
    });
};