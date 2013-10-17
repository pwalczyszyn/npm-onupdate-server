/* jshint node:true */
var hat = require('hat'),
    mongoose = require('mongoose'),
    passwordHash = require('password-hash'),
    Account = mongoose.model('Account'),
    emails = require('../../../../emails');

module.exports = function (req, res, next) {

    if (!req.body.email) {
        return next(new Error('Missing account email address!'));
    }

    if (!req.body.password) {
        return next(new Error('Missing account password!'));
    }

    if (!req.body.tosAgreed) {
        return next(new Error('Terms of service not agreed!'));
    }

    var email = req.body.email.trim().toLowerCase(),
        password = req.body.password;


    var account = new Account();
    account.email = email;
    account.pwdHash = passwordHash.generate(password);
    account.active = false;
    account.activationCode = hat();
    account.accessToken = hat();

    account.save(function (err, account) {
        if (err) {
            return next(err);
        }

        emails('activation', {
            to: account.email,
            from: req.app.get('noreply_email'),
            subject: '[' + req.app.get('title') + '] Activation',
            locals: {
                activationCode: account.activationCode
            }
        }, function (err) {

            if (err) {
                console.log('Error sending activation email: %s\n%s', err.message, err.stack);
            }

            res.send(200);
        });
    });
};