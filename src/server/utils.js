'use strict';

var crypto = require('crypto');

var utils = {};

utils.md5 = function (s) {
    var hash = crypto.createHash('md5');
    return hash.update(s + "").digest('hex');
};

utils.fileExistsSync = function (path) {
    var exists = false;
    try {
        exists = fs.statSync(path);
    } catch (err) {
        exists = false;
    }

    return !!exists;
};

utils.lsof = function (port, fn) {
    var cp = require('child_process');
    cp.exec('lsof -i:' + port, function (err, d) {
        d = d.split('\n');
        var data = [];
        var headers = d[0].toLowerCase().split(/\s+/);
        headers.forEach(function (v, k) {
            /*istanbul ignore next*/
            if (v === '') {
                delete headers[k];
            }
        });
        delete d[0]; //Remove the headers
        d.pop(); //Remove the last dead space
        d.forEach(function (v) {
            v = v.split(/\s+/);
            var k = {};
            var finalField = v[headers.length];
            /*istanbul ignore else*/
            if (finalField) {
                // There is one more field than there are headers. Interpret that state info.
                // These are things like '(LISTEN)' or '(ESTABLISHED)'. Save it into the state
                // field minus the parenthesis and lowercased
                k['state'] = finalField.substring(1, finalField.length - 1).toLowerCase();
                v.pop();
            }
            v.forEach(function (s, i) {
                k[headers[i]] = s;
            });
            data.push(k);
        });
        fn(data);
    });
};

utils.parsePositiveInteger = function (val) {
    var pi = val >> 0;
    if (pi < 0) pi = 0;
    return pi;
};

function isLeapYear(year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
}

utils.getDaysInMonth = function (year, month) {
    return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};



module.exports = utils;