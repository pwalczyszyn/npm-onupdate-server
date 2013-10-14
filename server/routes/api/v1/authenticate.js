/* jshint node:true */
var mongoose = require('mongoose'),
    passwordHash = require('password-hash'),
    Account = mongoose.model('Account');

module.exports = function (req, res, next) {

    if (!req.body.email) {
        return next(new Error('Missing account email address!'));
    }

    if (!req.body.password) {
        return next(new Error('Missing account password!'));
    }

    var email = req.body.email.trim().toLowerCase(),
        password = req.body.password;

    Account.findByEmail(email, function (err, account) {
        if (err) {
            return next(err);
        }

        if (passwordHash.verify(password, account.pwdHash)) {
            
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify({
                'access_token': account.accessToken,
                'token_type': 'Bearer'
            }));
            res.end();
            
        } else {
            res.send(401);
        }
    });



};