"use strict";

var _ = require("lodash");
var moment = require("moment");
var async = require("async");
var utils = require("../utils");
var CustomerSession = require("../database/customerSession");
var Message = require("../database/message");

var customerSessionController = module.exports;

customerSessionController.get = function (req, res, next) {

    CustomerSession.findById(req.params.uuid, function (err, customerSession) {

        if (err) return next(err);

        return res.json({code: 200, msg: customerSession});
    });
};

customerSessionController.query = function (req, res, next) {
    var condition = {cid: req.params.cid};

    // fist seen
    CustomerSession.findOne(condition, function (err, customerSession) {

        if (err) return next(err);

        async.parallel([
            function (next) { // address
                if (utils.isPrivateIPV4(customerSession.ip)) return next(null, 'local');

                utils.getCountry(customerSession.ip, function (err, countryInfo) {

                    if (err) return next(err);

                    if (countryInfo && countryInfo.country) {
                        return next(null, countryInfo.country.names.en);
                    }

                    return next(null, 'Unknown');
                });
            }, function (next) { // last seen
                condition.type = 0;
                Message.getLatestMessage(condition, ['createdAt'], next);
            }
        ], function (err, results) {
            if (err) return next(err);

            var customer = _.pick(customerSession, ['cid', 'email']);
            customer.address = results[0];
            customer.firstSeen = moment(customerSession.createdAt).startOf('hour').fromNow();
            customer.lastContacted = customer.lastSeen = moment(results[1].createdAt).startOf('hour').fromNow();

            return res.json({code: 200, msg: customer});
        });
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

        return res.json({code: 200, msg: data});
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

        return res.json({code: 200, msg: 'success update'});
    });
};

customerSessionController.delete = function (req, res, next) {
    var condition = {uuid: req.params.uuid};

    CustomerSession.delete(condition, function (err, data) {

        if (err) return next(err);

        return res.json({code: 200, msg: 'success delete'});
    });
};
