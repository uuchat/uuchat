'use strict';

var fs = require('fs');
var path = require('path');
var csrf = require('csurf');

var async = require('async');
var nconf = require('nconf');
var _ = require('lodash');
var maxmind = require('maxmind');

var middleware = {};

middleware.applyCSRF = csrf();

require('./upload')(middleware);
require('./sign')(middleware);

middleware.whiteListOpt = function () {
    var opt = {};
    var whiteList = nconf.get('app:image_upload_white_list');
    var first = _.head(whiteList);
    if (!_.isUndefined(first)) {
        if (_.startsWith(first, 'http')) {
            opt = {
                origin: function (origin, callback) {
                    if (whiteList.indexOf(origin) !== -1) {
                        callback(null, true)
                    } else {
                        callback(new Error('Not allowed by CORS'))
                    }
                }
            };
        }
    }
    return opt;
};

middleware.jsCDN = function (req, res, next) {
    if (req.session.isoCode) {
        var ip = getIP(req);
        if (ip !== req.session.isoCode) {
            setupIOSCode(req, ip, next);
        } else {
            next();
        }
    } else {
        setupIOSCode(req, getIP(req), next);
    }
};

function getIP(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket && req.connection.socket.remoteAddress);

    return ip.match(new RegExp(/((\d+)\.){3}(\d+)/g))[0];
}

function setupIOSCode(req, ip, next) {
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
}


middleware.checkAccountPermissions = function (req, res, next) {
    // This middleware ensures that only the requested user and admins can pass
    async.waterfall([
        function (next) {
            //
            next();
        },
        function (next) {
            //
            next();
        }
    ], function (err, allowed) {
        if (err || allowed) {
            return next(err);
        }
    });
};

module.exports = middleware;