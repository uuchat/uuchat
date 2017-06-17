/**
 * Created by jianzhiqiang on 2017/5/12.
 */
"use strict";

var async = require('async');
var Rate = require('../database/rate');
var CustomerSuccess = require('../database/customerSuccess');
var utils = require('../utils');
var _ = require('lodash');

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

rateController.report = function (req, res, next) {

    // not use union query
    async.parallel([
        function (callback) {
            CustomerSuccess.findAll(['csid', 'email', 'name'], {}, [['createdAt', 'ASC']], callback);
        },
        function (callback) {
            Rate.aggregate(['csid', 'rate'], {}, callback);
        }
    ], function (err, result) {
        if (err) return next(err);

        //aggregate results
        _.forEach(result[0], function (item) {
            var rates = _.filter(result[1], ['csid', item.csid]);

            item.favorablePercent = 0;
            item.rates = _.map(rates, function (item) {
                return {rate: item.rate, count: item.count};
            });

            var total = _.reduce(rates, function (sum, n) {
                    return sum + n.rate;
                }, 0) || 1;

            var favorable = _.reduce(rates, function (sum, n) {
                    if (n.rate > 3) return sum + n.rate;
                    return sum;
                }, 0) || 0;

            item.favorablePercent = Math.round(favorable * 100 / total);

            item.critical = _.reduce(rates, function (sum, n) {
                    if (n.rate < 3) return sum + n.rate;
                    return sum;
                }, 0) || 0;
        });

        res.json({code: 200, msg: result[0]});
    });
};