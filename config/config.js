/* jshint node:true*/
module.exports = {
    development: {
        ip: '127.0.0.1',
        port: process.env.PORT || 3000,
        db: 'mongodb://localhost/onupdate'
    },
    openshift: {
        ip: process.env.OPENSHIFT_NODEJS_IP,
        port: process.env.OPENSHIFT_NODEJS_PORT,
        db: 'mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' + process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' + process.env.OPENSHIFT_MONGODB_DB_HOST + ':' + process.env.OPENSHIFT_MONGODB_DB_PORT + '/' + process.env.OPENSHIFT_APP_NAME
    }
};