'use strict';

var fs = require('fs');
var path = require('path');
var csrf = require('csurf');

var async = require('async');
var nconf = require('nconf');
var _ = require('lodash');


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