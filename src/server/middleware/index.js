'use strict';

var fs = require('fs');
var csrf = require('csurf');

var async = require('async');
var nconf = require('nconf');
var _ = require('lodash');
var utils = require('../utils');

var middleware = {};

middleware.applyCSRF = csrf();

require('./upload')(middleware);
require('./sign')(middleware);

middleware.corsOptionsDelegate = function (req, next) {
    var whiteList = nconf.get('app:image_upload_white_list');
    var first = _.head(whiteList);
    if (!_.isUndefined(first)) {
        if (_.startsWith(first, 'http')) {
            var corsOptions;

            if (whiteList.indexOf(req.header('Origin')) !== -1) {
                corsOptions = { origin: true };
                next(null, corsOptions);
            }else{
                var origin = req.protocol + '://' + req.get('Referer').split('//')[1].split('/')[0];
                if (whiteList.indexOf(origin) !== -1) {
                    corsOptions = {origin: true};
                    next(null, corsOptions);
                } else {
                    corsOptions = { origin: false };
                    next(new Error('Not allowed by CORS'));
                }
            }

        } else {
            var corsOptions = { origin: true };
            next(null, corsOptions);
        }
    } else {
        var corsOptions = { origin: true };
        next(null, corsOptions);
    }
};

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