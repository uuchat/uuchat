"use strict";

var CustomerSession = require('../database/customerSession');

var customerSessionController = module.exports;

customerSessionController.get = function (req, res, next) {

    CustomerSession.findById(req.params.uuid, function (err, customerSession) {

        if (err) return next(err);

        return res.json({code: 200, msg: customerSession});
    });
};

customerSessionController.query = function (req, res, next) {
    var condition = {cid: req.params.cid};

    CustomerSession.findOne(condition, function (err, customerSession) {

        if (err) return next(err);

        return res.json({code: 200, msg: customerSession});
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
