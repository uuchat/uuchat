'use strict';

var winston = require('winston');
var _ = require('lodash');
var async = require('async');

var customerList = require('./customer');
var customerSuccessList = require('./customerSuccess');
var userAgent = require('./userAgent');
var chatHistory = require('../database/chatHistory');
var utils = require('../utils');
var logger = require('../logger');

var SocketAdapter = {};

SocketAdapter.emitCustomerList = function (csid) {
    var customerSuccess = customerSuccessList.get(csid);
    var that = this;
    if (!_.isEmpty(customerSuccess)) {
        var users = customerSuccess.users;

        if (!_.isEmpty(users)) {
            async.map(users, function (value, callback) {

                getMarkedByCid(value, csid, function (marked) {
                    var customer = customerList.get(value);
                    if (customer) {
                        callback(null, {
                            cid: value, name: customer.name,
                            info: that.reqParamsFormSocket(value), marked: marked
                        });
                    }
                });

            }, function (err, data) {
                if (err) {
                    winston.log(err);
                }
                if (data.length > 0) {
                    winston.info('emit cs.customer.list = %s', csid);
                    customerSuccess.socket.emit("cs.customer.list", data);
                }
            });
        }
    }
};

SocketAdapter.emitCustomer = function (csid, cid) {
    var customerSuccess = customerSuccessList.get(csid);
    if (!_.isEmpty(customerSuccess)) {
        var customer = customerList.get(cid);
        if (!_.isEmpty(customer)) {
            var that = this.reqParamsFormSocket(cid);
            winston.info('emit cs.customer.one cid = %s and csid = %s', cid, csid);
            async.waterfall([
                function (next) {
                    getMarkedByCid(cid, csid, function (marked) {
                        next(null, marked);
                    })
                },
                function (marked) {
                    customerSuccess.socket.emit("cs.customer.one",
                        {cid: cid, name: customer.name, info: that, marked: marked});
                }
            ]);
        }
    }
};


SocketAdapter.shortcuts = function (action, shortcut, fn) {
    if (customerSuccessList.onlineNum() === 0) return;
    var list = customerSuccessList.list();

    //emit all online customer success;
    _.forIn(list, function (value, key) {
        if (value.socket) {
            try {
                value.socket.emit("cs.shortcut", action, shortcut);
            } catch (e) {
            }
        } else {
            logger.error("because customer success if offline,  emit cs.shortcuts error: csid = %d", key)
        }
    });

    fn(true);

};

SocketAdapter.emitCustomerOfflineMessage = function (csid, data) {
    var customerSuccess = customerSuccessList.get(csid);
    if (!_.isEmpty(customerSuccess)) {
        customerSuccess.socket.emit("cs.customer.offline", data);
    }
};

SocketAdapter.reqParamsFormSocket = function (cid) {
    var ua = userAgent.get(cid);

    return {
        ip: ua.ip,
        host: ua.host,
        url: ua.url,
        platform: ua.platform,
        browser: ua.browser,
        version: ua.version,
        os: ua.os
    };
};

function getMarkedByCid(cid, csid, fn) {
    var data = {};
    data.cid = cid;
    data.csid = csid;
    chatHistory.findOne(data, function (err, data) {
        var marked = -1;
        if (!err) {
            try {
                marked = data.marked;
            } catch (e) {
            }
        }
        fn(marked);
    });
}


module.exports = SocketAdapter;