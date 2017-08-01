'use strict';

var url = require('url'),
    nconf = require('nconf'),
    _ = require('lodash'),
    winston = require('winston'),
    utils = require('../utils');

var ENABLE_CORS = {origin: true, maxAge: 86400},
    DISABLE_CORS = new Error('Not allowed by CORS');

module.exports = function (middleware) {
    middleware.corsOptionsDelegate = function (req, next) {
        var ips = utils.getServerIPs();
        var hostname = url.parse(req.get('Referer')).hostname;
        if (ips.indexOf(hostname) > -1) { //handleLocalIps
            return next(null, ENABLE_CORS);
        } else {
            handleWhitelist(req, next);
        }

    };

    function handleWhitelist(req, next) {
        var whiteList = nconf.get('app:whitelist');
        if(_.isUndefined(whiteList) || _.isEmpty(whiteList)){
            return next(DISABLE_CORS);
        }
        //allow all domain pass
        if (whiteList.indexOf("*") > -1) {
            return next(null, ENABLE_CORS);
        }
        //check origin
        var origin = url.parse(req.header('Origin')).hostname;
        //winston.info(origin);
        if (whiteList.indexOf(origin) > -1) {
            return next(null, ENABLE_CORS);
        }
        //check referer
        var hostname = url.parse(req.get('Referer')).hostname;
        //winston.info(hostname);
        if (whiteList.indexOf(hostname) > -1) { //firefox
            return next(null, ENABLE_CORS);
        }

        var filter = filterAsterisk(whiteList, hostname);
        if (filter) {
            return next(null, ENABLE_CORS);
        }

        return next(DISABLE_CORS);
    }

    function filterAsterisk(whiteList, hostname) {
        for(var x in whiteList) {
            if (_.startsWith(whiteList[x], '*.')) {
                if (_.endsWith(hostname, whiteList[x].split("*.")[1])) {
                    return true;
                }
            }
        }
        return false;
    }
};