/**
 * Created by jianzhiqiang on 2017/6/18.
 */
"use strict";

var async = require('async');
var _ = require('lodash');
var CustomerSuccess = require('../database/customerSuccess');
var ChatHistory = require('../database/chatHistory');
var Offline = require('../database/offline');
var Rate = require('../database/rate');
var utils = require('../utils');

var consoleController = module.exports;

consoleController.getNumbers = function (req, res, next) {
    let today = new Date(new Date().toDateString());

    async.parallel([
        function (callback) {
            ChatHistory.Count({where: {createdAt: {$gte: today}}}, function (err, data) {
                return callback(err, {dailyChats: data});
            });
        },
        function (callback) {
            Offline.Count({where: {createdAt: {$gte: today}}}, function (err, data) {
                return callback(err, {offlineCustomers: data});
            });
        },
        function (callback) {
            Rate.Count({where: {createdAt: {$gte: today}}}, function (err, data) {
                return callback(err, {dailyRates: data});
            });
        },
        function (callback) {
            Rate.Count({
                where: {
                    createdAt: {$gte: today},
                    rate: {
                        $in: [1, 2]
                    }
                }
            }, function (err, data) {
                return callback(err, {criticalRates: data});
            });
        }
    ], function (err, results) {
        if (err) return next(err);

        return res.json({code: 200, msg: results});
    });
}

consoleController.getMonthlyRateReport = function (req, res, next) {
    var monthInterval = getMonthInterval(req.params.month);
    var condition = {
        createdAt: {
            $gte: monthInterval.start,
            $lte: monthInterval.end
        }
    };

    // not use union query
    async.parallel([
        function (callback) {
            CustomerSuccess.findAll(['csid', 'email', 'name'], {}, [['createdAt', 'ASC']], callback);
        },
        function (callback) {
            Rate.aggregate(['csid', 'rate'], condition, callback);
        }
    ], function (err, result) {
        if (err) return next(err);

        var reports = _.filter(result[0], function (item) {
            item.rates = _.filter(result[1], ['csid', item.csid]);
            return item.rates.length;
        });

        //aggregate results
        _.forEach(reports, function (item) {

            item.favorablePercent = 0;
            item.rates = _.map(item.rates, function (element) {
                return {rate: element.rate, count: element.count};
            });

            var total = _.reduce(item.rates, function (sum, n) {
                    return sum + n.count;
                }, 0) || 1;

            item.total = total;

            var favorable = _.reduce(item.rates, function (sum, n) {
                    if (n.rate > 3) return sum + n.count;
                    return sum;
                }, 0) || 0;

            item.favorablePercent = Math.round(favorable * 100 / total);

            item.critical = _.reduce(item.rates, function (sum, n) {
                    if (n.rate < 3) return sum + n.count;
                    return sum;
                }, 0) || 0;
        });

        res.json({code: 200, msg: reports});
    });
};

consoleController.getMonthlyRateList = function (req, res, next) {

    var condition = {};

    var monthInterval = getMonthInterval(req.params.month);
    condition.createdAt = {
        $gte: monthInterval.start,
        $lte: monthInterval.end
    };

    var rate = req.query.rate;
    if (rate) condition.rate = rate;

    var order = [['createdAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 10;

    Rate.listAndCount(condition, order, pageSize, pageNum, function (err, data) {
        if (err) return next(err);

        res.json({code: 200, msg: data});
    });
};

function getMonthInterval(queryMonth) {
    var monthInterval = {};
    var year, month;

    if (/^\d{4}-\d{2}$/.test(queryMonth)) {
        var dateList = queryMonth.split('-');
        year = utils.parsePositiveInteger(dateList[0]);
        month = utils.parsePositiveInteger(dateList[1]) - 1;
    } else {
        var today = new Date();
        year = today.getFullYear();
        month = today.getMonth();
    }

    var monthMaxDays = utils.getDaysInMonth(year, month);
    monthInterval.start = new Date(year, month, 1, 0, 0, 0);
    monthInterval.end = new Date(year, month, monthMaxDays, 23, 59, 59);

    return monthInterval;
}