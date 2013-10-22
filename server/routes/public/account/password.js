/* jshint node:true */
var emails = require('../../../emails'),
    mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    hat = require('hat'),
    Recaptcha = require('re-captcha'),
    passwordHash = require('password-hash');

exports.request = function (req, res, next) {
    var recaptcha = new Recaptcha(req.app.get('captcha_public_key'), req.app.get('captcha_private_key'));

    function renderForm(invalids) {
        var captchaHtml = invalids.captcha ? recaptcha.toHTML(invalids.captcha.value) : recaptcha.toHTML();
        res.render('account/password-request', {
            form: true,
            captcha: captchaHtml,
            invalids: invalids
        });
    }

    if (req.method.toLowerCase() == 'get') { // Render form with email address & captcha
        renderForm({});
    } else { // Render info about sent mail

        // Validating email address
        req.checkBody('email', 'Invalid email value').isEmail();

        var invalids = req.validationErrors(true) || {},
            data = {
                remoteip: req.connection.remoteAddress,
                challenge: req.body.recaptcha_challenge_field,
                response: req.body.recaptcha_response_field
            };

        recaptcha.verify(data, function (err) {
            if (err) {
                invalids.captcha = {
                    param: 'captcha',
                    value: err
                };
            }
            if (Object.keys(invalids).length > 0) {
                renderForm(invalids);
            } else {

                var email = req.sanitize('email').trim().toLowerCase();
                Account.findByEmail(email, function (err, account) {
                    if (err) {
                        return next(err);
                    }

                    account.passwordCode = hat();
                    account.save(function (err) {
                        if (err) {
                            return next(err);
                        }

                        emails('password', {
                            to: account.email,
                            from: req.app.get('noreply_email'),
                            subject: '[' + req.app.get('title') + '] Password change',
                            locals: {
                                passwordCode: account.passwordCode
                            }
                        }, function (err) {
                            if (err) {
                                return next(err);
                            }

                            res.render('account/password-request', {
                                form: false
                            });
                        });
                    });
                });
            }
        });
    }
};

exports.set = function (req, res, next) {
    var recaptcha = new Recaptcha(req.app.get('captcha_public_key'), req.app.get('captcha_private_key'));

    function renderForm(invalids) {
        var captchaHtml = invalids.captcha ? recaptcha.toHTML(invalids.captcha.value) : recaptcha.toHTML();
        res.render('account/password-set', {
            form: true,
            captcha: captchaHtml,
            invalids: invalids
        });
    }

    Account.findByPasswordCode(req.params.passwordCode, function (err, account) {
        if (err) {
            return next(err);
        }
        if (!account) {
            return next(new Error('Invalid password code!'));
        }

        if (req.method.toLowerCase() == 'get') { // Render form with email address & captcha
            renderForm({});
        } else { // Render info about sent mail

            // Validating email address
            req.checkBody('password', 'Invalid password, 6 to 20 characters required').len(6, 20);

            var invalids = req.validationErrors(true) || {},
                data = {
                    remoteip: req.connection.remoteAddress,
                    challenge: req.body.recaptcha_challenge_field,
                    response: req.body.recaptcha_response_field
                };

            recaptcha.verify(data, function (err) {
                if (err) {
                    invalids.captcha = {
                        param: 'captcha',
                        value: err
                    };
                }
                if (Object.keys(invalids).length > 0) {
                    renderForm(invalids);
                } else {
                    account.pwdHash = passwordHash.generate(req.body.password);
                    account.passwordCode = undefined;
                    account.save(function (err) {
                        if (err) {
                            return next(err);
                        }

                        res.render('account/password-set', {
                            form: false
                        });
                    });
                }
            });
        }
    });
};