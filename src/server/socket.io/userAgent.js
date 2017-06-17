'use strict';

var _ = require('lodash');
var winston = require('winston');
var customerSession = require('../database/customerSession');
var logger = require('../logger');

var userAgent = {};

var data = {}; //store data of customer

userAgent.create = function(opts) {
    var cid = opts.cid;
    if (!_.isString(cid)) {
        cid = cid + '';
    }
    //need check browser more than one page!
    if(_.isUndefined(data[cid])) {
        data[cid] = {};
    }
    data[cid].platform = opts.platform || '';
    data[cid].browser = opts.browser || '';
    data[cid].version = opts.version || '';
    data[cid].os = opts.os || '';
    data[cid].ip = opts.ip || '';
    data[cid].host = opts.host || '';
    data[cid].url = opts.url || '';

    var needSnycDB = opts.needSnycDB || false;
    if (needSnycDB) {
    var cs = data[cid];
        cs.cid = cid;
        customerSession.create(cs, function (success) {
            if (!success) {
                logger.error('insert customer success error, and object is :');
                logger.error(cs);
            }
        });
    }
    return data[cid];
};

userAgent.get = function(cid) {
    if (_.isUndefined(data[cid])) {
        return {};
    }
    return data[cid];
};

userAgent.delete = function(cid) {
    delete data[cid];
};


module.exports = userAgent;