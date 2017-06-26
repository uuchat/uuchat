/**
 * Created by jianzhiqiang on 2017/5/12.
 */
"use strict";

var _ = require('lodash');
var Message = require('../database/message');
var utils = require('../utils');

var messageController = module.exports;

messageController.get = function (req, res, next) {
    Message.findById(req.params.uuid, function (err, message) {
        if (err) return next(err);

        res.json({code: 200, msg: message});
    });
};

messageController.create = function (req, res, next) {
    var message = {
        cid: req.params.cid,
        csid: req.params.csid,
        msg: req.body.msg,
        type: req.body.type || 0,
        device: req.body.device || 0
    };

    Message.insert(message, function (err, data) {
        if (err) return next(err);

        res.json({code: 200, msg: data});
    });
};

messageController.list = function (req, res, next) {
    var cid = req.params.cid;
    var csid = req.params.csid;

    var condition = {cid: cid};
    if (csid) condition.csid = csid;

    var order = [['createdAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 20;

    Message.list(condition, order, pageSize, pageNum, function (err, messages) {
        if (err) return next(err);

        res.json({code: 200, msg: _.reverse(messages)});
    });
};

messageController.delete = function (req, res, next) {

    var condition = {uuid: req.params.uuid};

    Message.delete(condition, function (err, data) {
        if (err) return next(err);

        res.json({code: 200, msg: 'success delete'});
    });
};

messageController.search = function (req, res, next) {
    if(!req.query.msg) return res.json({code:200, msg:[]});
    var condition = {
        msg: {
            '$like': '%' + req.query.msg + '%',
            '$notLike': 'content/upload/%',
        }
    };

    var order = [['createdAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 20;

    Message.list(condition, order, pageSize, pageNum, function (err, messages) {
        if (err) return next(err);

        res.json({code: 200, msg: messages});
    });
};