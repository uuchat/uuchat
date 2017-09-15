"use strict";

var _ = require('lodash');
var utils = require('../utils');
var CustomerStorage = require('../database/customerStorage');

var customerStorageController = module.exports;

customerStorageController.get = function (req, res, next) {

    CustomerStorage.findById(req.params.uuid, function (err, customerSession) {

        if (err) return next(err);

        return res.json({code: 200, msg: customerSession});
    });
};

customerStorageController.query = function (req, res, next) {
    var condition = {cid: req.params.cid};

    CustomerStorage.findOne(condition, function (err, customerSession) {

        if (err) return next(err);

        return res.json({code: 200, msg: customerSession});
    });
};

customerStorageController.create = function (req, res, next) {
    utils.setupIOSCode(req, utils.getIP(req), function () {
        var customerStorage = {
            cid: req.params.cid,
            firstTime: req.body.firstTime,
            lastTime: req.body.firstTime,
            timezone: req.body.timezone,
            firstScreen: req.body.firstScreen,
            lastScreen: req.body.firstScreen,
            language: req.body.language
        };

        customerStorage.screenList = JSON.stringify([{
            time: customerStorage.firstTime,
            screen: customerStorage.firstScreen
        }]);

        customerStorage.city = '';
        customerStorage.country = req.session.isoCode;

        customerStorage.browser = req.useragent.browser || '';
        customerStorage.bv = req.useragent.version || '';
        customerStorage.os = req.useragent.os || '';

        CustomerStorage.create(customerStorage, function (err, data) {

            if (err) return next(err);

            return res.json({
                code: 200,
                msg: _.pick(customerStorage, ['cid', 'city', 'country', 'browser', 'bv', 'os'])
            });
        });
    });
};

customerStorageController.update = function (req, res, next) {
    utils.setupIOSCode(req, utils.getIP(req), function () {
        var customerStorage = {
            lastTime: req.body.lastTime,
            chatTime: req.body.chatTime,
            lastScreen: req.body.lastScreen
        };

        customerStorage.city = '';
        customerStorage.country = req.session.isoCode;

        var condition = {cid: req.params.cid};

        CustomerStorage.findOne(condition, function (err, data) {
            if (err) return next(err);

            customerStorage.screenList = data && data.screenList ? JSON.parse(data.screenList) : [];
            customerStorage.screenList.push({time: customerStorage.lastTime, screen: customerStorage.lastScreen});
            customerStorage.screenList = JSON.stringify(customerStorage.screenList);

            CustomerStorage.update(customerStorage, condition, function (err, data) {

                if (err) return next(err);

                return res.json({code: 200, msg: _.pick(customerStorage, ['city', 'country'])});
            });
        });
    });
};

customerStorageController.delete = function (req, res, next) {
    var condition = {uuid: req.params.uuid};

    CustomerStorage.delete(condition, function (err, data) {

        if (err) return next(err);

        return res.json({code: 200, msg: 'success delete'});
    });
};

customerStorageController.list = function (req, res, next) {
    var condition = {};

    var order = [['createdAt', 'DESC']];

    if (req.query.sortField) order = [[req.query.sortField, req.query.sortOrder === 'ascend' ? 'ASC' : 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 10;

    CustomerStorage.listAndCount(condition, order, pageSize, pageNum, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};