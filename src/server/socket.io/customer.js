'use strict';

/**
 * customer object
 * need check undefined, events only check empty!
 * @type {exports|module.exports}
 */
var _ = require('lodash');
var winston = require('winston');

var customer = {};

var data = {}; //store data of customer

customer.create = function(opts) {
    var cid = opts.cid;
    if (!_.isString(cid)) {
        cid = cid + '';
    }
    //need check browser more than one page!
    if(_.isUndefined(data[cid])) {
        data[cid] = {};

    }
    data[cid].socket = opts.socket || {};
    data[cid].name = opts.name || '';
    data[cid].csid = opts.csid || '';
    return data[cid];
};

customer.list = function() {
    return data;
};

customer.get = function(cid) {
    if (_.isUndefined(data[cid])) {
        return {};
    }
    return data[cid];
};

customer.csid = function(cid) {
    if (_.isUndefined(data[cid])) {
        return '';
    }
    return data[cid].csid;
};

customer.delete = function(cid) {
    delete data[cid];
};

customer.onlineNum = function () {
    return _.keys(data).length;
};

customer.dataInfoLog = function () {
    winston.info('');
    winston.info("***** Online customer number = %s *****", this.onlineNum());
    if (_.isEmpty(data)) {return;}
    winston.info("----- Customers toString start -----");
    _.forIn(data, function (value, key) {
        var name = value.name;
        var csid = value.csid;
        winston.info("|----cid = %s, name = %s, csid = %s", key, name, csid);
    });
    winston.info("----- Customers toString end   -----");
};

module.exports = customer;