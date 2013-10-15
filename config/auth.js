/* jshint node:true */
var mongoose = require('mongoose'),
    passport = require('passport'),
    BearerStrategy = require('passport-http-bearer').Strategy;

module.exports = function (app) {

    passport.use(new BearerStrategy({}, function (token, done) {
        var Account = mongoose.model('Account');
        Account.findByAccessToken(token, function (err, account) {
            if (err) {
                return done(err);
            }

            if (!account) {
                return done(null, false);
            }
            return done(null, {
                id: account._id
            });
        });
    }));

    app.use(passport.initialize());
};