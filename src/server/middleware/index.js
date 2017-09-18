'use strict';

var csrf = require('csurf');

var async = require('async');
var _ = require('lodash');
var nconf = require('nconf');
var utils = require('../utils');
var logger = require('../logger');

var middleware = {};

middleware.applyCSRF = csrf();

require('./upload')(middleware);
require('./sign')(middleware);
require('./cors')(middleware);

middleware.jsCDN = function (req, res, next) {
    if (req.session.isoCode) {
        var ip = utils.getIP(req);
        if (ip !== req.session.isoCode) {
            utils.setupIOSCode(req, ip, next);
        } else {
            next();
        }
    } else {
        utils.setupIOSCode(req, utils.getIP(req), next);
    }
};

middleware.getCountry = function (req, res, next) {
    req.body.ip = utils.getIP(req);

    utils.getCountry(req.body.ip, function (err, countryInfo) {
        if (err) {
            logger.error(err);
            return next(err);
        }

        req.body.isoCode = nconf.get('CDN:DEFAULT');
        req.body.countryName = '';

        if (countryInfo && countryInfo.country) {
            req.body.isoCode = countryInfo.country.iso_code;
            req.body.countryName = countryInfo.country.names.en;
        }

        return next();
    });
};


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