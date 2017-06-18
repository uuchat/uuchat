/**
 * Created by jianzhiqiang on 2017/6/18.
 */
"use strict";

var async = require('async');
var ChatHistory = require('../database/chatHistory');
var Offline = require('../database/offline');
var Rate = require('../database/rate');

var consoleController = module.exports;

consoleController.getNumbers = function (req, res, next) {
    let today = new Date(new Date().toDateString());

    async.parallel([
        function (callback) {
            ChatHistory.Count({where: {createdAt: {$gte: today}}}, function (err, data) {
                return callback(err, {todayChats: data});
            });
        },
        function (callback) {
            Offline.Count({where: {createdAt: {$gte: today}}}, function (err, data) {
                return callback(err, {offlineCustomers: data});
            });
        },
        function (callback) {
            Rate.Count({where: {createdAt: {$gte: today}}}, function (err, data) {
                return callback(err, {todayRates: data});
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