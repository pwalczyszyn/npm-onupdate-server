/* jshint node:true */
var hat = require('hat'),
    mongoose = require('mongoose'),
    passwordHash = require('password-hash'),
    Account = mongoose.model('Account'),
    emails = require('../../../../emails');

module.exports = function (req, res, next) {

    req.checkBody('email', 'Invalid email value').isEmail();
    req.checkBody('password', 'Invalid password, 6 to 20 characters required').len(6, 20);
    req.checkBody('tosAgreed', 'Terms of service not agreed').is(true);

    var errors = req.validationErrors();
    if (errors) {
        return res.send(errors, 400);
    }

    var email = req.sanitize('email').trim().toLowerCase(),
        password = req.body.password;

    Account.findByEmail(email, function (err, result) {
        if (err) {
            return next(err);
        }
        if (result) {
            return res.send([{
                    param: 'email',
                    msg: 'Account with that email already exists',
                    value: email
                }], 400);
        }
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
    });
};