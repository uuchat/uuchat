/**
 * Created by jianzhiqiang on 2017/5/12.
 */
"use strict";

var nconf = require('nconf');
var _ = require('lodash');
var async = require('async');
var logger = require('../logger');
var utils = require('../utils');
var CustomerSession = require('../database/customerSession');

var customerSessionController = module.exports;

customerSessionController.get = function (req, res, next) {

    CustomerSession.findById(req.params.uuid, function (err, customerSession) {

        if (err) return next(err);

        res.json({code: 200, msg: customerSession});
    });
};

customerSessionController.query = function (req, res, next) {
    var condition = {cid: req.params.cid};

    CustomerSession.findOne(condition, function (err, customerSession) {

        if (err) return next(err);

        res.json({code: 200, msg: customerSession});
    });
};

customerSessionController.create = function (req, res, next) {
    var customer = {
        cid: req.body.cid,
        ip: req.body.ip,
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        browser: req.body.browser,
        systemName: req.body.systemName || 'win10',
        version: req.body.version,
        platform: req.body.platform,
        os: req.body.os,
        device: req.body.device,
        url: req.body.url
    };

    CustomerSession.insert(customer, function (err, data) {

        if (err) return next(err);

        res.json({code: 200, msg: data});
    });
};

customerSessionController.update = function (req, res, next) {
    var customer = {
        ip: req.body.ip,
        name: req.body.name,
        email: req.body.email,
        browser: req.body.browser,
        systemName: req.body.systemName,
        version: req.body.version,
        platform: req.body.platform,
        os: req.body.os,
        'url': req.body.url
    };

    if (req.body.device) customer.device = req.body.device;

    var condition = {};
    if (req.params.uuid) condition.uuid = req.params.uuid;
    if (req.params.cid) condition.cid = req.params.cid;

    CustomerSession.update(customer, condition, function (err, data) {

        if (err) return next(err);

        res.json({code: 200, msg: 'success update'});
    });
};

customerSessionController.delete = function (req, res, next) {
    var condition = {uuid: req.params.uuid};

    CustomerSession.delete(condition, function (err, data) {

        if (err) return next(err);

        res.json({code: 200, msg: 'success delete'});
    });
};

customerSessionController.checkMonthlyUploadSize = function (req, res, next) {
    var condition = {cid: req.params.cid};

    async.waterfall([
        function (callback) {
            CustomerSession.findOne(condition, callback);
        },
        function (customer, callback) {
            if (!customer) return res.json({code: 2000, message: 'customer not found'});

            var today = new Date().toLocaleDateString();
            var monthlyUploadSize = 0, fileSize = req.file.size || 0;
            var day = today;

            if (customer.upload) {
                day = customer.upload.slice(0, 10);
                monthlyUploadSize = utils.parsePositiveInteger(customer.upload.slice(11));
            }

            // first day of month
            if (today.slice(8, 10) === '01') {
                if (day === today) {
                    monthlyUploadSize += fileSize;
                } else {
                    monthlyUploadSize = fileSize;
                }
            } else {// other days of month
                // same month
                if (day.slice(0, 7) === today.slice(0, 7)) {
                    monthlyUploadSize += fileSize;
                } else { //different month
                    monthlyUploadSize = fileSize;
                }
            }

            if (monthlyUploadSize > nconf.get("images:monthlyMaxSize")) {
                return res.json({code: 5000, msg: 'EXCEED_MONTHLY_MAX_SIZE'});
            }

            req.file.monthlyUploadSize = today + 'D' + monthlyUploadSize;

            callback(null, req.file.monthlyUploadSize);
        },
        function (upload, callback) {
            var customer = {upload: upload};
            var condition = {uuid: customer.uuid};
            CustomerSession.update(customer, condition, callback);
        }
    ], function (err, result) {
        if (err) return next(err);

        next();
    });
}