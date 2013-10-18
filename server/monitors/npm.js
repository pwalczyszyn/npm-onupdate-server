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

        var monitorModel = result || new MonitorModel({
            _id: 'npm',
            lastSeq: 727094
        }),
            monitor = new Monitor(monitorModel);
        callback(null, monitor.start());
    });
};

var Monitor = function MonitorConstructor(monitorModel) {
    this.model = monitorModel;
    this.updatesQueue = [];
    this.lastSeq = this.model.get('lastSeq');
    this.feed = new follow.Feed({
        db: 'http://isaacs.iriscouch.com/registry',
        include_docs: false,
        since: this.lastSeq
    });
    this.feed.on('change', this._processChange.bind(this));
};

Monitor.prototype.start = function monitorStart() {
    this.feed.follow();
    return this;
};
Monitor.prototype.stop = function monitorStop(callback) {
    // Stopping the feed
    this.feed.stop();

    // Setting last seq value
    var queueSeq = this.updatesQueue.length > 0 ? this.updatesQueue[0].seq : this.lastSeq;
    this.model.set('lastSeq', Math.min(this.lastSeq, queueSeq));
    console.log('Setting npmMonitor.lastSeq:', this.model.get('lastSeq'));
    this.model.save(function (err) {
        if (err) {
            return callback(err);
        }
        return callback();
    });
};
Monitor.prototype._processChange = function _processChange(change) {
    var that = this;

    // Getting higher value
    this.lastSeq = Math.max(change.seq, this.lastSeq);

    Package.findOneByName(change.id, function (err, package) {
        if (err) {
            // TODO: handle it somehow
            return console.log('Error finding package by name: %s\nError message:%s\n%s', change.id, err.message, err.stack);
        }

        if (package) {
            // Pushing to queue of updates
            that.updatesQueue.push(change);

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

                    package.version = latestVersion;
                    package.updatedAt = new Date();

                    var latest = body.versions[latestVersion];
                    if (latest) {
                        package.description = latest.description;
                        package.homepage = latest.homepage || latest.url || 'https://npmjs.org/package/' + package.name;
                    }

                    package.save(function (err) {
                        if (err) {
                            return console.log('Error saving updated package: %s\nError message: %s\n%s', package.name, err.message, err.stack);
                        }
                        that.updatesQueue.splice(that.updatesQueue.indexOf(change), 1);
                    });
                } else {
                    that.updatesQueue.splice(that.updatesQueue.indexOf(change), 1);
                }
            });
        }
    });
};