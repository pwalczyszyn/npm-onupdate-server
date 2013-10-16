/* jshint node:true */
var mongoose = require('mongoose'),
    Monitor = mongoose.model('Monitor'),
    Package = mongoose.model('Package'),
    request = require('request'),
    follow = require('follow'),
    feed,
    npmMonitor,
    updatesQueue = [],
    lastSeq = 727094;

exports.start = function (callback) {

    Monitor.findById('npm', function (err, monitor) {
        if (err) {
            return callback(err);
        }

        npmMonitor = monitor || new Monitor({
            _id: 'npm',
            lastSeq: lastSeq
        });

        startMonitor();
    });

    function startMonitor() {
        feed = new follow.Feed({
            db: 'http://isaacs.iriscouch.com/registry',
            include_docs: false,
            since: npmMonitor.get('lastSeq')
        });
        feed.on('change', processChange);
        feed.follow();

        process.on('SIGTERM', endMonitor);
        process.on('SIGINT', endMonitor);

        callback();
    }

    function endMonitor() {
        var queueSeq = updatesQueue.length > 0 ? updatesQueue[0].seq : lastSeq;
        npmMonitor.set('lastSeq', Math.min(lastSeq, queueSeq));
        console.log('Setting npmMonitor.lastSeq:', npmMonitor.get('lastSeq'));
        npmMonitor.save(function (err) {
            if (err) {
                // TODO: handle it somehow
                console.log('Error saving monitor data object: %s\n%s', err.message, err.stack);
            }
            process.exit(0);
        });
    }

    function processChange(change) {
        // Getting higher value
        lastSeq = Math.max(change.seq, lastSeq);

        Package.findOneByName(change.id, function (err, package) {
            if (err) {
                // TODO: handle it somehow
                return console.log('Error finding package by name: %s\nError message:%s\n%s', change.id, err.message, err.stack);
            }

            if (package) {
                // Pushing to queue of updates
                updatesQueue.push(change);

                request({
                    url: 'http://registry.npmjs.org/' + package.name,
                    json: {}
                }, function (err, response, body) {

                    if (err) {
                        // TODO: handle it somehow
                        return console.log('Error getting package info: %s\nError message: %s\n%s', change.id, err.message, err.stack);
                    }

                    if (response.statusCode != 200) {
                        // TODO: handle it somehow
                        return console.log('Error getting package info: %s\nStatus code: %s', change.id, response.statusCode);
                    }

                    var latestVersion = body['dist-tags'].latest;
                    if (package.version != latestVersion) {

                        console.log('Package version changed:', package);

                        package.version = latestVersion;
                        package.updated_at = new Date();

                        var latest = body.versions[latestVersion];
                        if (latest) {
                            package.description = latest.description;
                            package.homepage = latest.homepage || latest.url || null;
                        }

                        package.save(function (err) {
                            if (err) {
                                return console.log('Error saving updated package: %s\nError message: %s\n%s', package.name, err.message, err.stack);
                            }
                            updatesQueue.splice(updatesQueue.indexOf(change), 1);
                        });
                    } else {
                        updatesQueue.splice(updatesQueue.indexOf(change), 1);
                    }
                });
            }
        });
    }
};