/* jshint node:true*/

var configs = {
    defaults: {
        title: 'npm-onupdate',
        url: 'http://npm-onupdate.info',
        smtp_host: process.env.SMTP_HOST, // 'email-smtp.us-east-1.amazonaws.com'
        smtp_tls: true,
        smtp_user: process.env.SMTP_USER,
        smtp_password: process.env.SMTP_PASSWORD,
        noreply_email: 'npm-onupdate <noreply@npm-onupdate.info>',
        admin_email: 'npm-onupdate admin <admin@npm-onupdate.info>',
        start_bg_services: true,
        captcha_public_key: process.env.CAPTCHA_PUBLIC_KEY,
        captcha_private_key: process.env.CAPTCHA_PRIVATE_KEY
    },
    local: {
        url: 'http://localhost:3000',
        ip: '127.0.0.1',
        port: process.env.PORT || 3000,
        db: 'mongodb://localhost/onupdate'
    },
    openshift: {
        ip: process.env.OPENSHIFT_NODEJS_IP,
        port: process.env.OPENSHIFT_NODEJS_PORT,
        db: 'mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' + process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' + process.env.OPENSHIFT_MONGODB_DB_HOST + ':' + process.env.OPENSHIFT_MONGODB_DB_PORT + '/' + process.env.OPENSHIFT_APP_NAME,
        start_bg_services: '5264e8ea5004469c53000067' == process.env.OPENSHIFT_GEAR_UUID
    }
};

module.exports = function (app) {
    applySettings(app, configs.defaults);
    applySettings(app, configs[process.env.ONUPDATE_CONFIGURATION || 'local']);
};

function applySettings(app, settings) {
    if (settings) {
        var key;
        for (key in settings) {
            app.set(key, settings[key]);
        }
    }
}