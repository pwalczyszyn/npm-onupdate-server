/* jshint node:true */

var app = require('../../server').app,
    async = require('async'),
    util = require('util'),
    emails = require('../emails'),
    mongoose = require('mongoose'),
    NotifierModel = mongoose.model('Notifier'),
    Account = mongoose.model('Account'),
    Package = mongoose.model('Package');

exports.start = function notifierStart(notifierId, callback) {
    NotifierModel.findById(notifierId, function (err, notifierModel) {
        if (err) {
            return callback(err);
        }
        if (!notifierModel) {
            return callback(new Error('Notifier model not found: ' + notifierId));
        }

        callback(null, new Notifier(notifierModel).start());
    });
};

var Notifier = function NotifierConstructor(notifierModel) {
    this.model = notifierModel;
    this.intervalId = null;
    this.accountsToNotify = this.model.accountsToNotify || [];
    this.isSenderActive = false;
    this.started = false;
};
Notifier.prototype.start = function () {
    var that = this;

    this.started = true;

    this.intervalId = setInterval(function () {
        that._execute.call(that);
    }, this.model.interval);

    if (this.model.executeAtStart) {
        this._execute();
    }

    return this;
};
Notifier.prototype.stop = function (callback) {
    this.started = false;
    clearInterval(this.intervalId);

    this.model.accountsToNotify = this.accountsToNotify;
    this.model.save(function (err) {
        if (err) {
            return callback(err);
        }

        callback();
    });
};
Notifier.prototype._execute = function () {
    var that = this,
        updatedPackages,
        rangeStart = this.model.lastCheck || new Date(),
        rangeEnd = new Date();

    if (this.started) {
        async.series([

            function findUpdatedPackages(callback) {
                Package.find({
                    updatedAt: {
                        $gte: rangeStart,
                        $lt: rangeEnd
                    }
                }, function (err, packages) {
                    if (err) {
                        return callback(err);
                    }
                    updatedPackages = packages;
                    callback();
                });
            },

            function findAccountsToNotify(callback) {
                var pIds = updatedPackages.map(function (package) {
                    return package._id;
                });
                Account.find({
                    active: true,
                    _id: {
                        $nin: that.accountsToNotify
                    },
                    alerts: {
                        $in: pIds
                    }
                }, '_id', function (err, accounts) {
                    if (err) {
                        return callback(err);
                    }

                    var aIds = accounts.map(function (account) {
                        return account._id;
                    });
                    that.accountsToNotify.push.apply(that.accountsToNotify, aIds);
                    callback();
                });
            },

            function updateNotifierModel(callback) {
                // Disabled for debugging purposes
                that.model.lastCheck = rangeEnd;
                that.model.save(callback);
            }

        ], function (err) {
            if (err) {
                // TODO: handle it somehow
                return console.log('Something went wrong when looking for accounts to notify!\nError message: %s\nError stack: %s', err.message, err.stack);
            }

            // Running notifications sender
            that._sendNotifications();
        });
    }
};
Notifier.prototype._sendNotifications = function () {
    if (this.started && !this.isSenderActive && this.accountsToNotify.length > 0) {

        // Setting sender to active state
        this.isSenderActive = true;

        var that = this,
            aId = this.accountsToNotify.shift(),
            account,
            updatedPackages,
            newNotifiedAt = new Date();
        console.log(aId);
        async.series([

            function findAccount(callback) {
                Account.findById(aId, function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    if (!result) {
                        return callback(new Error('Couldn\'t find Account to notify, the _id was: ' + aId));
                    }

                    account = result;
                    callback();
                });
            },

            function findAccountUpdatedPackages(callback) {
                var pIds = account.alerts.map(function (alert) {
                    return alert;
                });

                Package.find({
                    _id: {
                        $in: pIds
                    },
                    updatedAt: {
                        $gte: account.notifiedAt || account._id.getTimestamp(),
                        $lt: newNotifiedAt
                    }
                }, function (err, packages) {
                    if (err) {
                        return callback(err);
                    }

                    updatedPackages = util.isArray(packages) ? packages : [packages];
                    callback();
                });
            },

            function sendNotification(callback) {
                if (updatedPackages.length > 0) {
                    emails('onupdate', {
                        to: account.email,
                        from: app.get('noreply_email'),
                        subject: '[' + app.get('title') + '] Updates available',
                        locals: {
                            updates: updatedPackages
                        }
                    }, callback);
                } else {
                    console.log('****************************************************************************');
                    console.log('ERROR: Check why no packages with updates were found:\nAccount:', account.email, '\nPacakges updatedAt: ', {
                        $gte: account.notifiedAt || account._id.getTimestamp(),
                        $lt: newNotifiedAt
                    }, '\nAccount alerts: ', account.alerts, '\naccountsToNotify: ', that.accountsToNotify);
                    console.log('****************************************************************************');
                    callback();
                }
            },

            function updateAccount(callback) {
                account.notifiedAt = newNotifiedAt;
                account.save(callback);
            }

        ], function (err) {
            if (err) {
                // TODO: handle it somehow
                console.log('Something went wrong when notifying account!\nError message: %s\nError stack: %s', err.message, err.stack);
            }

            if (that.accountsToNotify.length === 0) {
                // At this point there is nothing in the queue
                that.isSenderActive = false;
            } else {
                // Scheduling next notificate to a next tick
                process.nextTick(function () {
                    that._sendNotifications.call(that);
                });
            }
        });
    }
};