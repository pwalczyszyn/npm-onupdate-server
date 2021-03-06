/* jshint node:true */
var mongoose = require('mongoose'),
    MonitorModel = mongoose.model('Monitor'),
    Package = mongoose.model('Package'),
    request = require('request'),
    follow = require('follow');

exports.start = function (callback) {
    MonitorModel.findById('npm', function (err, result) {
        if (err) {
            return callback(err);
        }
        if (!result) {
            return callback(new Error('npm monitor config not found'));
        }

        var monitor = new Monitor(result);
        callback(null, monitor.start());
    });
};

var Monitor = function MonitorConstructor(monitorModel) {
    this.model = monitorModel;
    this.feed = new follow.Feed({
        db: 'http://isaacs.iriscouch.com/registry',
        include_docs: false,
        since: this.model.get('lastSeq')
    });
    this.feed.on('change', this._processChange.bind(this));
    this.feed.on('error', function (err) {
        // TODO: send email with error to admin
        console.log('follow.Feed has experienced some serious error: %s\n%s', err.message, err.stack);
    });
};

Monitor.prototype.start = function monitorStart() {
    this.feed.follow();
    return this;
};
Monitor.prototype.stop = function monitorStop(callback) {
    // Stopping the feed
    this.feed.stop();
    callback();
};
Monitor.prototype._processChange = function _processChange(change) {
    console.log('%s has changed: %j', change.id, change);

    this.model.set('lastSeq', Math.max(change.seq, this.model.get('lastSeq')));
    this.model.set('lastChangeAt', new Date());
    this.model.save(function (err) {
        if (err) {
            // TODO: send email to admin
            console.log('Error updating npm monitor data model: %s\n%s', err.message, err.stack);
        }
    });

    Package.findOneByName(change.id, function (err, package) {
        if (err) {
            // TODO: handle it somehow
            return console.log('Error finding package by name: %s\nError message:%s\n%s', change.id, err.message, err.stack);
        }

        if (package) {
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
                    return console.log('Error getting package info: %s\nStatus code: %s\nError reason: %s', change.id, response.statusCode, body.reason);
                }

                var latestVersion = body['dist-tags'].latest;
                if (package.version != latestVersion) {

                    console.log('Package version changed:', package);

                    package.prevVersion = package.version;
                    package.version = latestVersion;
                    package.updatedAt = new Date();
                    package.registryUpdatedAt = new Date(body.time[latestVersion]);

                    var latest = body.versions[latestVersion];
                    if (latest) {
                        package.description = latest.description;
                        package.homepage = latest.homepage || latest.url || 'https://npmjs.org/package/' + package.name;
                    }
                    package.save(function (err) {
                        if (err) {
                            return console.log('Error saving updated package: %s\nError message: %s\n%s', package.name, err.message, err.stack);
                        }
                    });
                }
            });
        }
    });
};