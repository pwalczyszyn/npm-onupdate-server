/* jshint node:true */

var mongoose = require('mongoose'),
    NotifierModel = mongoose.model('Notifier'),
    Account = mongoose.model('Account'),
    Package = mongoose.model('Package'),
    notifiers = {};

exports.start = function notifierStart(notifierId, callback) {
    NotifierModel.findById(notifierId, function (err, notifierModel) {
        if (err) {
            return callback(err);
        }

        if (!notifierModel) {
            return callback(new Error('Notifier model not found: ' + notifierId));
        }
        notifiers[notifierId] = new Notifier(notifierModel).start();
        callback();
    });
};

exports.stop = function notifierStop(notifierId) {
    var notifier = notifiers[notifierId];
    if (notifier) {
        notifier.stop();
        delete notifiers[notifierId];
    }
};

var Notifier = function (notifierModel) {
    this.model = notifierModel;
    this.intervalId = null;
};
Notifier.prototype.start = function () {
    var that = this;
    this.intervalId = setInterval(function () {
        that._execute.call(that);
    }, this.model.interval);
    if (this.model.executeAtStart) {
        this._execute();
    }
    return this;
};
Notifier.prototype.stop = function () {
    clearInterval(this.intervalId);
    return this;
};
Notifier.prototype._execute = function () {
    //    lastCheck
    console.log('xxxx', this);

};