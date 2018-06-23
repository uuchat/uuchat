"use strict";

var moment = require('moment');
var _ = require('lodash');
var utils = require('../utils');
var ChatHistory = require('../database/chatHistory');
var Op = require('sequelize').Op;

var chatHistoryController = module.exports;

chatHistoryController.create = function (req, res, next) {
    var chatHistory = {
        cid: req.params.cid,
        csid: req.params.csid,
        marked: req.body.marked
    };

    ChatHistory.insert(chatHistory, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

chatHistoryController.list = function (req, res, next) {
    var condition = {csid: req.params.csid};
    var order = [['updatedAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 100;

    return ChatHistory.list(condition, order, pageSize, pageNum, function (err, chatHistories) {
        if (err) return next(err);

        return res.json({code: 200, msg: chatHistories});
    });
};

chatHistoryController.getLatestMonthChats = function (req, res, next) {
    var condition = {csid: req.params.csid};

    condition.updatedAt = {
        [Op.gt]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
    };

    var order = [['updatedAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 100;

    return ChatHistory.list(condition, order, pageSize, pageNum, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

chatHistoryController.search = function (req, res, next) {
    var condition = {};

    if (req.query.csid) condition.csid = req.query.csid;

    var order = [['updatedAt', 'DESC']];
    if (req.query.sortField) order = [[req.query.sortField, req.query.sortOrder === 'ascend' ? 'ASC' : 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = utils.parsePositiveInteger(req.query.pageSize) || 10;

    return ChatHistory.listAndCount(condition, order, pageSize, pageNum, function (err, chatHistories) {
        if (err) return next(err);

        chatHistories.rows = chatHistories.rows.map(function(item){
            item = item.get({plain: true});
            item.createdAt = moment(item.createdAt).format('YYYY-MM-DD HH:mm');
            item.updatedAt = moment(item.updatedAt).format('YYYY-MM-DD HH:mm');
            return _.omit(item, ['marked']);
        });

        return res.json({code: 200, msg: chatHistories});
    });
};