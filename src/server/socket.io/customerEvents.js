'use strict';

var _ = require('lodash');
var nconf = require('nconf');
var logger = require('../logger');
var winston = require('winston');
var async = require('async');

var customerList = require('./customer');
var customerSuccessList = require('./customerSuccess');
var socketAdapter = require('./socketAdapter');
var message = require('../database/message');
var chatHistory = require('../database/chatHistory');
var rate = require('../database/rate');
var userAgent = require('./userAgent');
var utils = require('../utils');

var queue = [];


var SocketCustomerEvents = {};

/**
 * customer start a chat and select a customer success;
 * @param socket
 * @param cid
 * @param fn 1: success, 2: lineup, 3: error
 */
SocketCustomerEvents.select = function(socket, cid, name, fn) {
    var customer = customerList.get(cid);

    if (_.isEmpty(customerSuccessList.select())) {
        console.log("all cs not online");
        //offline message need select a customer success to user.
        message.listLastTen(cid, "", function (data) {
            if (data) {
                fn(3, {"cid": cid, "csid": "", "name": nconf.get('app:name'), "photo": "", "msg": data})
            } else {
                fn(3, {"cid": cid, "csid": "", "name": nconf.get('app:name'), "photo": "", "msg": []})
            }
        });
        return;
    }

    if (!_.isEmpty(customer)) { // has chat in other places;
        var _customerSuccess = customerSuccessList.get(customer.csid);
        if (!_.isEmpty(_customerSuccess)) {
            customer.socket = socket;

            customerSuccessList.userPush(customer.csid, cid);
            socketAdapter.emitCustomer(customer.csid, cid);
            chatHistory.createOrUpdate(cid, customer.csid, function(success){
                if (!success) {
                    logger.error("chat history operation error. cid = %s and csid = %s", cid, customer.csid);
                }
            });

            selectAfter(cid, _customerSuccess, customer.csid, fn);
        }
        logger.log("customer = %s has online on other page", cid);
        //fn(3, {"code": 1001, "msg": "has online on other page!"});
        return;
    } else {
        customer = customerList.create({cid: cid, name: name});
    }

    //select customer success
    var csid = customerSuccessList.select();
    customer.csid = csid;
    customer.socket = socket;

    var customerSuccess = customerSuccessList.get(csid);
    var list = customerSuccess.users;

    if (!_.isEmpty(list) && list.length >= nconf.get('app:maxChatNum')) {
        queue.push(cid);
        fn(2, {"lineup": true, "num": queue.length});
    } else {
        customerSuccessList.userPush(csid, cid);
        socketAdapter.emitCustomer(csid, cid);
        chatHistory.createOrUpdate(cid, csid, function(success){
            if (!success) {
                logger.error("chat history operation error. cid = %s and csid = %s", cid, csid);
            }
        });
        selectAfter(cid, customerSuccess, csid, fn);
    }
};


function selectAfter(cid, customerSuccess, csid, fn) {
    //chat history and return message
    message.listLastTen(cid, csid, function (data) {
        // avatar info from csid;
        var photo = customerSuccess.photo || '';
        if (data) {
            fn(1, {"cid": cid, "csid": csid, "name": customerSuccess.name, "photo": photo, "msg": data})
        } else {
            fn(1, {"cid": cid, "csid": csid, "name": customerSuccess.name, "photo": photo, "msg": []})
        }
    });
}

SocketCustomerEvents.offlineMessage = function(cid, msg, fn) {
    sendMessage(true, cid, msg, fn);
};

SocketCustomerEvents.message = function(cid, msg, fn) {
    sendMessage(false, cid, msg, fn);
};

SocketCustomerEvents.timeout = function(cid) {
    var csid = customerList.get(cid).csid;
    var customerSuccess = customerSuccessList.get(csid);
    customerSuccess.socket.emit('c.timeout', cid);
};

function sendMessage(isOfflineMessage, cid, msg, fn){
    if (_.isUndefined(msg) || _.isNull(msg) || msg.length === 0) {
        winston.info("message is empty!");
        fn(false);
        return;
    }
    //and max length
    if (Buffer.byteLength(msg, 'utf8') > 512) {
        winston.info("message is too long!");
        fn(false);
        return;
    }

    var csid = customerList.get(cid).csid;
    // if (_.isEmpty(csid)) {
    //     fn(false);
    //     return;
    // }

    if (!isOfflineMessage) {
        var customerSuccess = customerSuccessList.get(csid);
        if (_.isEmpty(customerSuccess) || _.indexOf(customerSuccess.users, cid) < 0) {
            fn(false);
            return;
        }
    }
    var data = {};
    data.cid = cid;
    data.csid = csid;
    data.msg = msg;
    message.create(data, function(success){
        if (!success) {
            logger.error('customer message insert to DB error');
            logger.error(data);
        }
    });
    if (!isOfflineMessage) {
        try {
            customerSuccess.socket.emit("c.message", cid, msg);
        } catch (e) {
            logger.error(e.message);
            fn(false);
        }
    }

    fn(true);
}

SocketCustomerEvents.rate = function(cid, value, ip, fn) {
    //null check
    if (_.isUndefined(value)) {
        winston.info("value is empty!");
        fn(false, "rate value is null");
        return;
    }
    var csid = customerList.get(cid).csid;
    if (_.isEmpty(csid)) {
        fn(false, 'customer success not online , can not rate him.');
        return;
    }
    //insert DB
    var obj = {};
    obj.cid = cid;
    obj.csid = csid;
    obj.rate = value;
    obj.ip = ip;
    rate.create(obj, function (success) {
        if(success) {
            fn(true, null);
        } else {
            fn(false, 'insert database error');
        }
    });
};

SocketCustomerEvents.lineUpNotify = function() {
    if (queue.length === 0) {
        return;
    }
    var list = customerList.list(); //TODO
    var maxCustomerNum = nconf.get('app:maxChatNum') * customerSuccessList.onlineNum();
    winston.info("_.keys(list).length = %d, maxCustomerNum = %d ", _.keys(list).length, maxCustomerNum);
    if (_.keys(list).length <= maxCustomerNum) {
        winston.info("start queue shift!");
        var first;
        for(var i = 0; i < queue.length; i++){
            first = queue.shift();
            if(list[first]){
                break;
            }
        }
        var target = list[first];
        winston.info("queue shift csid = %s", first);
        if (target) {
            var csid = customerSuccessList.select();
            var cid = first;
            customerSuccessList.userPush(csid, cid);
            socketAdapter.emitCustomer(csid, cid);
            //chat history and return message
            message.listLastTen(cid, csid, function(data){
                if (!data) {
                    data = [];
                }
                target.socket.emit("c.queue.shift",
                    {"cid": cid, "csid": csid, "name": customerSuccessList.get(csid).name, "msg": data});
            });
            //delete list[first];
        }
    }

    var pos = 0;
    _.forEach(queue, function(value) {
        var target = list[value];
        if (target) {
            pos++;
            target.socket.emit("c.queue.update", pos);
        }
    });
};

SocketCustomerEvents.disconnect = function(cid) {
    logger.info("------user = %s, disconnect start", cid);
    var customer = customerList.get(cid);
    if (_.isEmpty(customer)) return;
    //1. delete from queue
    if (queue.length > 0) {
        _.pull(queue, cid);
    }
    //2. notify customer service;
    var csid = customer.csid;
    if (!_.isEmpty(csid)) {
        if (customerSuccessList.canEmit(csid)) {
            customerSuccessList.get(csid).socket.emit('c.disconnect', cid);
        }
        customerSuccessList.userPull(csid, cid);
    }
    //3. delete from customer data
    customerList.delete(cid);

    //4. delete user agent
    //TODO refresh page need disconnect first
    //userAgent.delete(cid);

    logger.info("------user = %s, disconnected", cid);
};

module.exports = SocketCustomerEvents;