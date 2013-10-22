/* jshint node:true */
var mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    passwordHash = require('password-hash');

module.exports = function (req, res, next) {

    req.checkBody('newPassword', 'Invalid password, 6 to 20 characters required').len(6, 20);
    req.checkBody('currentPassword', 'Current password is not set').notEmpty();

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
        if (!passwordHash.verify(req.body.currentPassword, account.pwdHash)) {
            return res.send([{
                    param: 'currentPassword',
                    msg: 'Wrong password!'
                }], 400);
        }

        account.pwdHash = passwordHash.generate(req.body.newPassword);
        account.save(function (err) {
            if (err) {
                return next(err);
            }
            res.send(200);
        });
    });
};