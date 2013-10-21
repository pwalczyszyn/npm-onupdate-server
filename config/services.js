/* jshint node: true */

var async = require('async');

module.exports = function (app) {
    if (app.get('start_bg_services')) {
        // Start npm monitoring service
        var npmMonitor;
        require('../server/monitors').npm.start(function (err, monitor) {
            if (err) {
                // TODO: send email to admin
                return console.log('Error starting npm monitoring service: %s\n%s', err.message, err.stack);
            }
            npmMonitor = monitor;
            console.log('npm monitor started');
        });

        // Start notifier service
        var hourlyNotifier;
        require('../server/notifier').start('hourly', function (err, notifier) {
            if (err) {
                // TODO: send email to admin
                return console.log('Error starting hourly notifier service: %s\n%s', err.message, err.stack);
            }
            hourlyNotifier = notifier;
            console.log('hourly notifier started');
        });

        process.on('SIGINT', stopServices);
        process.on('SIGTERM', stopServices);
    }

    function stopServices() {
        async.parallel([

            function stopNpmMonitor(callback) {
                if (npmMonitor) {
                    npmMonitor.stop(callback);
                }
            },

            function stopHourlyNotifier(callback) {
                if (hourlyNotifier) {
                    hourlyNotifier.stop(callback);
                }
            }

        ], function (err) {
            if (err) {
                // TODO: send mail to admin
                console.log('Error stopping service!\nError message: %s\nError stack: %s', err.message, err.stack);
            } else {
                console.log('All services stopped successfully.');
            }
            process.exit(0);
        });
    }
};