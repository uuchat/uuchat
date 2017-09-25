"use strict";

var _ = require('lodash');
var utils = require('../utils');
var CustomerStorage = require('../database/customerStorage');

var customerStorageController = module.exports;

customerStorageController.get = function (req, res, next) {

    CustomerStorage.findById(req.params.uuid, function (err, customerStorage) {

        if (err) return next(err);

        return res.json({code: 200, msg: customerStorage});
    });
};

customerStorageController.getScreens = function (req, res, next) {

    CustomerStorage.findById(req.params.uuid, function (err, customerStorage) {

        if (err) return next(err);

        try {
            return res.json({code: 200, msg: JSON.parse(customerStorage["screenList"])});
        } catch (e) {
            return next(e);
        }
    });
};

customerStorageController.query = function (req, res, next) {
    var condition = {cid: req.params.cid};

    CustomerStorage.findOne(condition, function (err, customerStorage) {

        if (err) return next(err);

        return res.json({code: 200, msg: customerStorage});
    });
};

customerStorageController.create = function (req, res, next) {
    var firstTime = parseInt(req.body.firstTime) || new Date().getTime();

    var customerStorage = {
        cid: req.params.cid,
        firstTime: firstTime,
        lastTime: firstTime,
        timezone: req.body.timezone,
        firstScreen: req.body.firstScreen,
        lastScreen: req.body.firstScreen,
        language: req.body.language
    };

    customerStorage.screenList = JSON.stringify([{
        time: customerStorage.firstTime,
        screen: customerStorage.firstScreen
    }]);

    customerStorage.city = req.body.city || '';
    customerStorage.country = req.body.isoCode;

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
};

customerStorageController.update = function (req, res, next) {
    var lastTime = parseInt(req.body.lastTime) || new Date().getTime();
    var chatTime = parseInt(req.body.chatTime) || new Date().getTime();

    var customerStorage = {
        lastTime: lastTime,
        chatTime: chatTime,
        lastScreen: req.body.lastScreen
    };

    customerStorage.city = req.body.city || '';
    customerStorage.country = req.body.isoCode;

    var condition = {cid: req.params.cid};

    CustomerStorage.findOne(condition, function (err, data) {
        if (err) return next(err);

        // no data to update
        if (!data) return res.json({code: 200, msg: _.pick(customerStorage, ['city', 'country'])});

        customerStorage.screenList = data && data.screenList ? JSON.parse(data.screenList) : [];
        customerStorage.screenList.push({time: customerStorage.lastTime, screen: customerStorage.lastScreen});
        customerStorage.screenList = JSON.stringify(customerStorage.screenList);

        CustomerStorage.update(customerStorage, condition, function (err, data) {

            if (err) return next(err);

            return res.json({code: 200, msg: _.pick(customerStorage, ['city', 'country'])});
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

    if (req.query.lastTimeStart || req.query.lastTimeEnd) {
        condition.lastTime = {};

        if (req.query.lastTimeStart) condition.lastTime['$gte'] = req.query.lastTimeStart;
        if (req.query.lastTimeEnd) condition.lastTime ['$lte'] = req.query.lastTimeEnd;
    }

    if (req.query.country) condition.country = req.query.country;

    var order = [['createdAt', 'DESC']];
    if (req.query.sortField) order = [[req.query.sortField, req.query.sortOrder === 'ascend' ? 'ASC' : 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 10;

    CustomerStorage.listAndCount(condition, order, pageSize, pageNum, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};