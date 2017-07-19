"use strict";

var async = require('async');
var nconf = require('nconf');
var _ = require('lodash');
var Shortcut = require('../database/shortcut');
var utils = require('../utils');

var shortcutController = module.exports;

shortcutController.get = function (req, res, next) {

    Shortcut.findById(req.params.uuid, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

shortcutController.create = function (req, res, next) {
    var shortcut = {
        csid: req.params.csid || '',
        shortcut: req.body.shortcut,
        message: req.body.message,
        type: req.params.csid ? 1 : 0
    };

    Shortcut.create(shortcut, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success create'});
    });
};

shortcutController.patch = function (req, res, next) {
    var shortcut = {
        shortcut: req.body.shortcut,
        message: req.body.message
    };
    var condition = {uuid: req.params.uuid};

    Shortcut.update(shortcut, condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success update'});
    });
};

shortcutController.delete = function (req, res, next) {
    var condition = {uuid: req.params.uuid};

    Shortcut.delete(condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success delete'});
    });
};

shortcutController.list = function (req, res, next) {
    var csid = req.params.csid || '';

    var condition = getCondition(csid);
    var order = [['createdAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 10;

    Shortcut.listAndCount(condition, order, pageSize, pageNum, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

shortcutController.listAll = function (req, res, next) {
    var csid = req.params.csid || '';

    if (!csid) return res.json({code: 9000, msg: 'csid_null'});

    var condition = getCondition(csid);
    var attributes = ['type', 'shortcut', 'message'];

    Shortcut.listAll(attributes, condition, function (err, data) {
        if (err) return next(err);

        // remove repeat shortcut
        var msg = _.uniqBy(_.orderBy(data, ['type'],['desc']), 'shortcut');

        // remove property:type
        msg = _.map(msg, function (item) {
            return _.omit(item, 'type');
        });

        // sort by shortcut
        msg = _.orderBy(msg, ['shortcut'], ['asc']);

        return res.json({code: 200, msg: msg});
    });
};

function getCondition(csid) {
    return {
        type: csid ? 1 : 0,
        csid: csid
    };
}