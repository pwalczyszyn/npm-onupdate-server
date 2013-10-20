/* jshint node:true */
var mongoose = require('mongoose'),
    passwordHash = require('password-hash'),
    Account = mongoose.model('Account');

module.exports = function (req, res, next) {

    // Validating request params
    req.checkBody('email', 'Invalid email value').isEmail();
    req.checkBody('password', 'Invalid password, 6 to 20 characters required').len(6, 20);
    var errors = req.validationErrors();
    if (errors) {
        return res.send(400); // Returning Bad request error
    }

    var email = req.sanitize('email').trim().toLowerCase(),
        password = req.body.password;

    Account.findByEmail(email, function (err, account) {
        if (err) {
            return next(err);
        }
        if (!account || !passwordHash.verify(password, account.pwdHash)) {
            return res.send(401); // Returning Unauthorized error
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(JSON.stringify({
            'access_token': account.accessToken,
            'token_type': 'Bearer'
        }));
        res.end();
    });
};