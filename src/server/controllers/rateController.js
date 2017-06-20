/**
 * Created by jianzhiqiang on 2017/5/12.
 */
"use strict";

var async = require('async');
var Rate = require('../database/rate');
var utils = require('../utils');

var rateController = module.exports;

rateController.get = function (req, res, next) {

    Rate.findById(req.params.uuid, function (err, rate) {
        if (err) return next(err);

        res.json({code: 200, msg: rate});
    });
};

rateController.create = function (req, res, next) {
    var rate = {
        cid: req.body.cid,
        csid: req.body.csid,
        rate: req.body.rate,
        ip: req.body.ip
    };

    Rate.create(rate, function (success) {
        if (!success) return next(new Error('create rate error'));

        res.json({code: 200, msg: "success"});
    });
};

rateController.patch = function (req, res, next) {
    var rate = {rate: req.body.rate};
    var condition = {uuid: req.params.uuid};

    Rate.update(rate, condition, function (err, data) {
        if (err) return next(err);

        res.json({code: 200, msg: 'success update'});
    });
};

rateController.delete = function (req, res, next) {
    var condition = {uuid: req.params.uuid};

    Rate.delete(condition, function (err, data) {
        if (err) return next(err);

        res.json({code: 200, msg: 'success delete'});
    });
};

rateController.list = function (req, res, next) {
    var cid = req.params.cid;
    var csid = req.params.csid;

    var condition = {};
    if (cid) condition.cid = cid;
    if (csid) condition.csid = csid;

    var order = [['createdAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 10;

    Rate.listAndCount(condition, order, pageSize, pageNum, function (err, data) {
        if (err) return next(err);

        res.json({code: 200, msg: data});
    });
};