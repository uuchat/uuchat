/**
 * Created by longhao on 2017/5/6.
 */
var winston = require('winston');
var _ = require('lodash');
var async = require('async');

var customerList = require('./customer');
var customerSuccessList = require('./customerSuccess');
var userAgent = require('./userAgent');
var chatHistory = require('../database/chatHistory');
var utils = require('../utils');

var SocketAdapter = {};

SocketAdapter.emitCustomerList = function (csid) {
    var customerSuccess = customerSuccessList.get(csid);
    var that = this;
    if (!_.isEmpty(customerSuccess)) {
        var users = customerSuccess.users;

        if (!_.isEmpty(users)) {
            async.map(users, function(value, callback) {

                getMarkedByCid(value, csid, function (success, marked) {
                    if (!success) {
                        marked = -1;
                    }
                    var customer = customerList.get(value);
                    if (customer) {
                        callback(null, {cid: value, name: customer.name,
                            info: that.reqParamsFormSocket(value), marked: marked});
                    }
                });

            }, function(err, data) {
                if( err ) {
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
            var that = this.reqParamsFormSocket(cid) ;
            winston.info(that);
            winston.info('emit cs.customer.one cid = %s and csid = %s', cid, csid);
            async.waterfall([
                function (next) {
                    getMarkedByCid(cid, csid, function (success, marked) {
                        if (success) {
                            next(null, marked);
                        } else {
                            next(null, '');
                        }
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

SocketAdapter.emitCustomerOfflineMessage = function (csid, data) {
    var customerSuccess = customerSuccessList.get(csid);
    if (!_.isEmpty(customerSuccess)) {
        customerSuccess.socket.emit("cs.customer.offline", data);
    }
};

SocketAdapter.reqParamsFormSocket = function(cid) {
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
        if (err) {
            fn(false, null);
        }
        try {
            var marked = data.marked;
            fn(true, marked);
        } catch (e) {
            fn(false, null);
        }
    });
}


module.exports = SocketAdapter;