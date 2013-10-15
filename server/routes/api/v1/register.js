/* jshint node:true */
var hat = require('hat'),
    mongoose = require('mongoose'),
    passwordHash = require('password-hash'),
    Account = mongoose.model('Account');

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

        res.send(200);
    });
    //    Account.findByEmail(email, function (err, account) {
    //        if (err) {
    //            return next(err);
    //        }
    //
    //        if (passwordHash.verify(password, account.pwdHash)) {
    //            
    //            res.writeHead(200, {
    //                'Content-Type': 'application/json'
    //            });
    //            res.write(JSON.stringify({
    //                'access_token': account.accessToken,
    //                'token_type': 'Bearer'
    //            }));
    //            res.end();
    //            
    //        } else {
    //            res.send(401);
    //        }
    //    });



};