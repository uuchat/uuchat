'use strict';

var winston = require('winston');
var _ = require('lodash');
var async = require('async');

var customerSession = require('../database/customerSession');
var socketAdapter = require('./socketAdapter');
var message = require('../database/message');
var logger = require('../logger');

var MessageAdapter = {};

MessageAdapter.listOfflineMessage = function (csid) {

    message.offlineMessageCidList(5, function (err, data) {

        logger.info("offline message cid list is " + data);

        _.forEach(data, function (msg) {

            logger.info("offline message cid is " + msg.cid);

            var cid = msg.cid;

            message.listOfflineMessageByCid(cid, function (err, msgData) {

                logger.info("offline message list is: " + msgData);

                customerSession.findOne({cid: cid}, function (err, customer) {

                    logger.info("offline message customer is: " + customer);

                    // deal null
                    customer = customer || {};

                    var info = socketAdapter.reqParamsFormSocket(cid);

                    var obj = {"cid": cid, "email": customer.email || '', "updatedAt": customer.updatedAt || '',
                                "info": info, "msg": msgData};

                    socketAdapter.emitCustomerOfflineMessage(csid, obj);

                    //update message to csid;
                    message.update({csid: csid}, {cid: cid, csid: null}, function (data) {
                    });
                });
            });
        });
    });
};

module.exports = MessageAdapter;