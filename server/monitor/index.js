/* jshint node:true */
var mongoose = require('mongoose'),
    Changes = require('changes'),
    changes = new Changes({
        url: 'http://isaacs.iriscouch.com/registry',
        timeout: {
            max: 60000,
            step: 5000
        },
        updateSeq: 726035
    });

//
// Dump changes as they come in.
//
changes.on('change', function (doc) {
    console.log('\n________________________________________________________________\n');
    console.dir(doc);
});


exports.start = function () {

    changes.listen(function (err) {
        if (err) {
            console.log('Did not connect to _changes on first attempt');
            console.dir(err);
            changes.retry.enabled = false;
            return process.exit(1);
        }

        console.log('Listening for _changes');
    });
}