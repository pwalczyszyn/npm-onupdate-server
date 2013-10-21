/* jshint node:true */

var path = require('path'),
    templatesDir = path.join(__dirname, 'templates'),
    emailTemplates = require('email-templates'),
    emailjs = require('emailjs'),
    app = require('../../server').app,
    emailServer = emailjs.server.connect({
        host: app.get('smtp_host'),
        tls: app.get('smtp_tls'),
        user: app.get('smtp_user'),
        password: app.get('smtp_password')
    });

module.exports = function emails(templatePath, data, callback) {

    emailTemplates(templatesDir, function (err, template) {
        if (err) {
            if (callback) {
                callback(err);
            }
            return;
        }

        data.locals = data.locals || {};
        data.locals.title = data.locals.title || app.get('title');
        data.locals.url = data.locals.url || app.get('url');

        template(templatePath, data.locals, function (err, html, text) {
            if (err) {
                if (callback) {
                    callback(err);
                }
                return;
            }

            var message = {
                from: data.from,
                to: 'development' == app.get('env') ? 'piotr.walczyszyn@gmail.com' : data.to, // Just making sure I don't send emails during dev
                subject: data.subject,
                text: text,
                'Reply-To': data.replyTo || undefined
            };

            if (html !== null && html !== '') {
                message.attachment = [
                    {
                        data: html,
                        alternative: true
                    }
                ];
            }

            emailServer.send(message, function (err, message) {
                if (err) {
                    if (callback) {
                        callback(err);
                    }
                    return;
                }

                if (callback) {
                    callback(null, message);
                }
            });
        });
    });
};