"use strict";

var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var CustomerSuccess = require('../database/customerSuccess');
var Message = require('../database/message');
var ChatHistory = require('../database/chatHistory');
var Rate = require('../database/rate');
var utils = require('../utils');
var sequelize = require('sequelize');
var nconf = require('nconf');
var Op = sequelize.Op;

var consoleController = module.exports;

var memMonthlyData;

consoleController.getNumbers = function (req, res, next) {
    var createdAtStart = req.query.createdAtStart ? new Date(parseInt(req.query.createdAtStart)) : new Date(new Date().toDateString());
    var createdAtEnd = req.query.createdAtEnd ? new Date(parseInt(req.query.createdAtEnd)) : null;

    let timeCondition = {
        [Op.gte]: createdAtStart
    };

    if (createdAtEnd) {
        timeCondition = {
            [Op.gte]: createdAtStart,
            [Op.lte]: createdAtEnd
        }
    }

    async.parallel([
        function (callback) {
            ChatHistory.count({where: {updatedAt: timeCondition}}, function (err, data) {
                return callback(err, {dailyChats: data});
            });
        },
        function (callback) {
            Message.count({where: {csid: null, createdAt: timeCondition}}, function (err, data) {
                return callback(err, {offlineCustomers: data});
            });
        },
        function (callback) {
            var sql = "SELECT cid,csid,type,MIN(createdAt) as createdAt FROM message " +
                "WHERE EXISTS(SELECT 1 FROM chat_history WHERE updatedAt >=:updatedAtStart ";

            if (createdAtEnd) {
                sql += 'AND updatedAt <= :updatedAtEnd ';
            }

            sql += "AND message.cid = chat_history.cid AND message.csid = chat_history.csid)" +
                " AND type IN (0,1) GROUP BY cid,csid,type";

            var params = {
                updatedAtStart: utils.UTCFormat(createdAtStart)
            };

            if (createdAtEnd) {
                params.updatedAtEnd = utils.UTCFormat(createdAtEnd);
            }

            Message.rawQuery(sql, params, function (err, data) {
                var firstRespondTime = 0, missChats = 0;

                if (data && data.length) {
                    var part = _.groupBy(data, function (o) {
                        return o.cid + o.csid;
                    });

                    var count = 0;

                    Object.keys(part).forEach(function (key) {
                        if (part[key].length === 2) {
                            var start = new Date(part[key][0].createdAt).getTime();
                            var end = new Date(part[key][1].createdAt).getTime();

                            firstRespondTime += Math.abs(start - end);
                            count++;
                        } else if (part[key].length === 1 && part[key][0]['type'] === 0) {
                            missChats++;
                        }
                    });

                    if (count > 0) firstRespondTime = firstRespondTime / count / 1000 >> 0;
                }

                return callback(err, {firstRespondTime, missChats});
            });
        }
    ], function (err, results) {
        if (err) return next(err);

        var numbers = results.reduce(function (result, value) {
            _.assign(result, value);
            return result;
        }, {});

        return res.json({code: 200, msg: numbers});
    });
};

consoleController.getChatData = function (req, res, next) {
    var createdAtStart = req.query.createdAtStart ? new Date(parseInt(req.query.createdAtStart)) : new Date(new Date().toDateString());
    var createdAtEnd = req.query.createdAtEnd ? new Date(parseInt(req.query.createdAtEnd)) : new Date();

    var condition = {
        updatedAt: {
            [Op.gte]: createdAtStart,
            [Op.lte]: createdAtEnd
        }
    };

    if (req.query.csid) condition.csid = req.query.csid;

    var type = 'hour';
    var intervalTime = (createdAtEnd.getTime() - createdAtStart.getTime()) / 86400000;
    if (intervalTime > 1) type = 'day';

    var options = {
        where: condition,
        attributes: [
            [type === 'hour' ? sequelize.fn('substr', sequelize.col('updatedAt'), 12, 2) : sequelize.fn('date', sequelize.col('updatedAt')), type],
            [sequelize.fn('count', '*'), 'count']
        ],
        group: type
    };

    // special sqlite: Setting a custom timezone is not supported by SQLite, dates are always returned as UTC.
    var databaseConfig = process.env.NODE_ENV === 'test' ? nconf.get('test_database') : nconf.get('database');
    if (databaseConfig.dialect === 'sqlite') {
        options = {
            where: condition,
            attributes: [
                [type === 'hour' ? sequelize.fn('substr', sequelize.fn('time', sequelize.col('updatedAt'), 'localtime'), 1, 2) : sequelize.fn('date', sequelize.col('updatedAt'), 'localtime'), type],
                [sequelize.fn('count', '*'), 'count']
            ],
            group: type
        };
    }

    ChatHistory.findAll(options, function (err, data) {
        if (err) return next(err);

        var transData = transferChatData(data, type, createdAtStart, createdAtEnd);

        return res.json({code: 200, msg: transData});
    });
};

consoleController.getRateData = function (req, res, next) {
    var createdAtStart = req.query.createdAtStart ? new Date(parseInt(req.query.createdAtStart)) : new Date(new Date().toDateString());
    var createdAtEnd = req.query.createdAtEnd ? new Date(parseInt(req.query.createdAtEnd)) : null;

    var condition = {
        createdAt: {
            [Op.gte]: createdAtStart
        }
    };

    if (createdAtEnd) {
        condition.createdAt = {
            [Op.gte]: createdAtStart,
            [Op.lte]: createdAtEnd
        };
    }

    if (req.query.csid) condition.csid = req.query.csid;

    Rate.aggregate(['rate'], condition, function (err, results) {
        if (err) return next(err);

        var rateScale = [1, 2, 3, 4, 5];

        var reports = [];

        rateScale.forEach(function (rate) {
            var filters = results.filter(function (item) {
                return item.rate === rate;
            });

            reports.push({
                x: rate + '',
                y: filters.length ? filters[0].count : 0
            });
        });

        return res.json({code: 200, msg: reports});
    });
};

consoleController.getMonthlyRateReport = function (req, res, next) {
    var monthInterval = getMonthInterval(req.params.month);
    var condition = {
        createdAt: {
            [Op.gte]: monthInterval.start,
            [Op.lte]: monthInterval.end
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

    var condition = {csid: req.params.csid};

    var monthInterval = getMonthInterval(req.params.month);
    condition.createdAt = {
        [Op.gte]: monthInterval.start,
        [Op.lte]: monthInterval.end
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

function transferChatData(data, type, createdAtStart, createdAtEnd) {
    let transData = [];

    if (type === 'hour') {
        transData = transferChatToHourScale(data);
    } else {
        transData = transferChatToDayScale(data, createdAtStart, createdAtEnd);
    }

    return transData;
}

function transferChatToHourScale(data) {
    const hourLength = 24;

    let transData = [];

    for (var i = 0; i < hourLength; i++) {
        var hourScale = i + '';

        if (hourScale.length === 1) {
            hourScale = '0' + hourScale;
        }

        var filters = data.filter((item)=> hourScale === item.hour);

        transData.push({
            x: hourScale,
            y: filters.length ? filters[0].count : 0
        });
    }

    return transData;
}

function transferChatToDayScale(data, createdAtStart, createdAtEnd) {
    var startTS = createdAtStart.getTime();
    var endTS = createdAtEnd.getTime();

    const dayLength = (endTS - startTS) / 86400000;

    let transData = [];

    for (var i = 0; i < dayLength; i++) {
        var dayScale = moment(startTS).add(i, 'days').format('YYYY-MM-DD');

        var filters = data.filter((item)=> dayScale === item.day);

        transData.push({
            x: dayScale,
            y: filters.length ? filters[0].count : 0
        });
    }

    return transData;
}