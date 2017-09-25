"use strict";

var async = require('async');
var Rate = require('../database/rate');
var utils = require('../utils');

var rateController = module.exports;

rateController.get = function (req, res, next) {

    Rate.findById(req.params.uuid, function (err, rate) {
        if (err) return next(err);

        return res.json({code: 200, msg: rate});
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

        return res.json({code: 200, msg: "success"});
    });
};

rateController.patch = function (req, res, next) {
    var rate = {rate: req.body.rate};
    var condition = {uuid: req.params.uuid};

    Rate.update(rate, condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success update'});
    });
};

rateController.delete = function (req, res, next) {
    var condition = {uuid: req.params.uuid};

    Rate.delete(condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success delete'});
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

        return res.json({code: 200, msg: data});
    });
};

rateController.search = function (req, res, next) {
    var condition = {};

    if (req.query.csid) condition.csid = req.query.csid;
    if (req.query.rate) condition.rate = req.query.rate;

    if (req.query.createdAtStart || req.query.createdAtEnd) {
        condition.createdAt = {};

        if (req.query.createdAtStart) condition.createdAt["$gte"] = req.query.createdAtStart;
        if (req.query.createdAtEnd) condition.createdAt["$lte"] = req.query.createdAtEnd;
    }

    var order = [['createdAt', 'DESC']];
    if (req.query.sortField) order = [[req.query.sortField, req.query.sortOrder === 'ascend' ? 'ASC' : 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 10;

    return Rate.listAndCount(condition, order, pageSize, pageNum, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};