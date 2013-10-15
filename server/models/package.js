/* jshint node:true*/
var mongoose = require('mongoose');

module.exports = function () {

    var PackageSchema = new mongoose.Schema({

        name: {
            type: String,
            unique: true,
            required: true
        },

        version: {
            type: String,
            required: true
        },

        updated_at: Date,

        checked_at: Date,

        homepage: String,

        description: String

    });

    PackageSchema.static('findByNames', function (names, callback) {
        this.find({
            name: {
                $in: names
            }
        }, callback);
    });

    return PackageSchema;
};