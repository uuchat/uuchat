'use strict';

var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var nconf = require('nconf');
var _ = require('lodash');
var maxmind = require('maxmind');

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
            if (finalField) {
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


utils.getIP = function (req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket && req.connection.socket.remoteAddress);

    return ip.match(new RegExp(/((\d+)\.){3}(\d+)/g))[0];
};

utils.getServerIPs = function () {
    var ifaces = os.networkInterfaces(),
        ips = [
            'localhost'
        ];

    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            // only support IPv4
            if (iface.family !== 'IPv4') {
                return;
            }

            ips.push(iface.address);
        });
    });

    return ips;
};

utils.setupIOSCode = function (req, ip, next) {
    if (ip) {
        maxmind.open(nconf.get('mmdb:path'), (err, orgLookup) => {
            var ipInfo = orgLookup.get(ip);
            var isoCode = nconf.get('CDN:DEFAULT');
            if (ipInfo) {
                isoCode = ipInfo.country.iso_code
            }
            if (_.isUndefined(isoCode) || _.isEmpty(isoCode)) {
                isoCode = nconf.get('CDN:DEFAULT');
            }
            req.session.isoCode = isoCode;
            next();
        });
    } else {
        req.session.isoCode = nconf.get('CDN:DEFAULT');
        next();
    }
};

/**
 * get country information via mmdb
 * @param ip
 * @param callback
 */
utils.getCountry = function (ip, callback) {
    maxmind.open(nconf.get('mmdb:path'), (err, orgLookup) => {
        if (err) return callback(err);

        return callback(null, orgLookup.get(ip));
    });
};

utils.mkdir = function (dir) {
    if (!fs.existsSync(dir)) fs.mkdir(dir);
};

module.exports = utils;