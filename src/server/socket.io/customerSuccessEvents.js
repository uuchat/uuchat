'use strict';

var winston = require('winston');
var _ = require('lodash');
var utils = require('../utils');
var logger = require('../logger');

var customerSuccessList = require('./customerSuccess');
var customerList = require('./customer');
var socketAdapter = require('./socketAdapter');
var message = require('../database/message');
var chatHistory = require('../database/chatHistory');
var offline = require('../database/offline');


var SocketCustomerSuccessEvents = {};

SocketCustomerSuccessEvents.setup = function(socket) {
    var session = socket.request.session;
    if (!session) return ;
    var csid = session.csid;
    winston.info('customer success id is : %s', csid);
    if (_.isUndefined(csid)) {
        logger.error('csid is null , need Login again!');
        socket.emit('uu error', 'csid is null, need login again!');
        return ;
    }

    var customerSuccess = customerSuccessList.get(csid);

    //system to start and reconnect
    if (_.isEmpty(customerSuccess)) {
        winston.info('system has restart');
        // if synchronous create and customerSuccess.socket, there is no lock for customerSuccess
        // so customerSuccess.socket not success;
        customerSuccessList.create({csid: csid, socket: socket, name: session.csName, photo: session.photo});
        dealCustomerOfflineMsg(csid);
        return ;
    }

    if (!_.isEmpty(customerSuccess.socket)) {
        customerSuccess.socket.emit('cs.need.login', function (success) {
                if (success) {
                    setTimeout(function(){
                        setupAfter(customerSuccess, socket, csid);
                    }, 1000);
                }
            }
        );
    } else {
        winston.info('customer success login or refresh browser');
        setupAfter(customerSuccess, socket, csid);
    }

};

function setupAfter(customerSuccess, socket, csid) {
    customerSuccess.socket = socket;
    socketAdapter.emitCustomerList(csid);
    dealCustomerOfflineMsg(csid);
}

SocketCustomerSuccessEvents.refreshOnlineInfo = function() {
    if (global.env === 'development') {
        customerSuccessList.dataInfoLog();
        customerList.dataInfoLog();
    }

    if (customerSuccessList.onlineNum() == 0) return;

    var list = customerSuccessList.list();

    var result = {};
    //contains own customer num
    _.forIn(list, function (value, key) {
        var customerOnlineNum = 0;
        if (value.users) {
            customerOnlineNum = value.users.length;
        }
        result[key] = [value.name, value.photo, customerOnlineNum];
    });

    _.forIn(list, function (value, key) {
        if (!_.isEmpty(list[key].socket)) {
            list[key].socket.emit("cs.online.info", result);
        }
    });

};

SocketCustomerSuccessEvents.message = function(cid, msg, fn) {
    // null check ;
    if (_.isUndefined(msg) || msg.length == 0) {
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

    var customer = customerList.get(cid);
    if (!_.isEmpty(customer)) {
        customer.socket.emit('cs.message', customer.csid, msg);
        // add message to DB;
        //socketDao.customerSuccessMsg(cid, customer.csid, msg);
        var data = {};
        data.cid = cid;
        data.csid = customer.csid;
        data.msg = msg;
        data.type = 1;
        message.create(data, function(success){
            if (!success) {
                logger.error('customer success message insert to DB error: ');
                logger.error(data);
            }
        });
        fn(true);
    } else {

        winston.info("customer is offline;");
        fn(false);
    }

};

SocketCustomerSuccessEvents.marked = function(cid, csid, marked, fn) {
    if (_.isUndefined(marked)) {
        winston.info("marked is empty!");
        fn(false);
        return;
    }

    chatHistory.updateMarked(cid, csid, marked, function(success) {
        fn(success);
    });

};

SocketCustomerSuccessEvents.rate = function(cid, fn) {
    var customer = customerList.get(cid);
    if (!_.isEmpty(customer)) {
        customer.socket.emit("cs.action.rate");
        fn(true);
    } else {
        fn(false);
    }
};

SocketCustomerSuccessEvents.offlineMessage = function(cid, csid, msg, fn) {
    try {
        logger.info("offline message to: " + cid);
        // add offline message to DB;
        var data = {};
        data.cid = cid;
        data.csid = csid;
        data.msg = msg;
        data.type = 2;
        message.create(data, function(success){
            if (!success) {
                logger.error('customer message insert to DB error ');
                logger.error(data);
            }
        });
    } catch (err) {
        logger.error("send offline message error is : " + err);
        fn(false);
    } finally {

    }
    fn(true);
};

SocketCustomerSuccessEvents.dispatch = function(to, cid, fn) {
    var customerSuccess = customerSuccessList.get(to);
    var customer = customerList.get(cid);
    if (!_.isEmpty(customerSuccess) && !_.isEmpty(customer)) {
        //add db dispatch message
        var data = {};
        data.cid = cid;
        data.csid = customer.csid;
        data.msg = "dispatch from: name = " + customerSuccess.name;
        data.type = 3;
        message.create(data, function(success){
            if (!success) {
                logger.error('dispatch message insert to DB error ');
                logger.error(data);
            }
        });

        var userInfo = socketAdapter.reqParamsFormSocket(cid);
        winston.info(userInfo);
        //to server
        customerSuccess.socket.emit('cs.dispatch', cid, customer.name, userInfo);
        //to client
        customer.socket.emit('c.dispatch', to, customerSuccess.name, customerSuccess.photo);

        logger.info("dispatch customer cid = %s to customer success = %s", cid, to);

        customerSuccessList.userPull(customer.csid, cid);
        customer.csid = to;
        chatHistory.createOrUpdate(cid, to, function(success){
            if (!success) {
                logger.error("chat history operation error. cid = %s and csid = %s", cid, csid);
            }
        });
        customerSuccessList.userPush(to, cid);
        fn(true);
    } else {
        fn(false);
    }
};

SocketCustomerSuccessEvents.changeOnOff = function(csid, stat, fn) {
    var customerSuccess = customerSuccessList.get(csid);
    if (_.isEmpty(customerSuccess)) fn(false) ;
    customerSuccess.status = stat;
    fn(true);
};

// typing
SocketCustomerSuccessEvents.status = function(cid, status, fn) {
    var customer = customerList.get(cid);
    if (!_.isEmpty(customer)) {
        fn(true);
        customer.socket.emit('cs.status', status);
    } else {
        fn(false);
    }
};

SocketCustomerSuccessEvents.close = function(cid, fn) {
    var customer = customerList.get(cid);
    if (!_.isEmpty(customer)) {
        customer.socket.emit("cs.close.dialog");
        customerSuccessList.userPull(customer.csid, cid);
        customerList.delete(cid);
        fn(true);
    } else {
        fn(false);
    }
};

SocketCustomerSuccessEvents.logout = function(socket, csid, fn) {
    disconnect(csid);
    customerSuccessList.delete(csid);
    this.refreshOnlineInfo();

    delete socket.request.session.csid;

    fn(true);
};

/**
 * disconnect only refresh online info， then add use to offline queue;
 * @param csid
 */
SocketCustomerSuccessEvents.disconnect = function(csid) {
    logger.info("customer success = %s disconnect start!", csid);
    //logger.info("offline all user");
    //disconnect(csid);

    //logger.info("delete customer success info");
    //customerSuccessList.delete(csid);

    customerSuccessList.get(csid).socket = {}; // set socket null;

    logger.info("refresh online info");

    this.refreshOnlineInfo();

    logger.info("customer success disconnected!");
};

function dealCustomerOfflineMsg(csid) {
    //1. list offline customer message;
    offline.listPending(function(data){
        _.forEach(data, function(value) {
            var obj = {cid: value.cid, name: value.name, email: value.email, content: value.content};
            //2. emit json to customer success;
            socketAdapter.emitCustomerOfflineMessage(csid, obj);
            var msg = {};
            msg.cid = value.cid;
            msg.csid = csid;
            msg.msg = JSON.stringify(obj);
            msg.type = 4;
            //3. insert message and update csid of offline
            message.create(msg, function(success){
                if (!success) {
                    logger.error('Customer offline message insert to DB error ');
                    logger.error(msg);
                } else {
                    offline.updateStatusByUUID(2, csid, value.uuid, function(success){
                        if (!success) {
                            logger.error('update offline message status by UUID error uuid = %s', value.uuid);
                        }
                    });
                }
            });
        });
    });
}

function disconnect(csid) {
    var customerSuccess = customerSuccessList.get(csid);
    if (_.isEmpty(customerSuccess)) return ;

    var list = customerSuccess.users;
    if (!_.isEmpty(list)) {
        _.forEach(list, function (value) {
            var customer = customerList.get(value);
            if (customer) {
                customer.socket.emit("cs.disconnect");
            }
        });
        customerSuccess.users = [];
    }
}

module.exports = SocketCustomerSuccessEvents;