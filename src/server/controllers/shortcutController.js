"use strict";

var async = require('async');
var nconf = require('nconf');
var _ = require('lodash');
var Shortcut = require('../cache/shortcut');
var SocketAdapter = require('../socket.io/socketAdapter');
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
        csid: req.body.csid || '',
        shortcut: req.body.shortcut,
        msg: req.body.msg,
        type: req.body.csid ? 1 : 0
    };

    if (!shortcut.shortcut) return res.json({code: 9001, msg: 'shortcut_null'});

    Shortcut.create(shortcut, function (err, data) {
        if (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                return res.json({
                    code: 9002, msg: 'shortcut_already_used'
                });
            }
            return next(err);
        }

        if (data.type === 0) {
            SocketAdapter.shortcuts('INSERT', _.pick(data, ['id', 'shortcut', 'msg']), function (result) {

            });
        }

        return res.json({code: 200, msg: data});
    });
};

shortcutController.patch = function (req, res, next) {
    var shortcut = {
        shortcut: req.body.shortcut,
        msg: req.body.msg
    };
    var condition = {id: req.params.id};

    Shortcut.update(shortcut, condition, function (err, data) {
        if (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                return res.json({
                    code: 9002, msg: 'shortcut_already_used'
                });
            }
            return next(err);
        }
        if (data.type === 0) {
            SocketAdapter.shortcuts('UPDATE', _.pick(data, ['id', 'shortcut', 'msg']), function (result) {

            });
        }

        return res.json({code: 200, msg: 'success update'});
    });
};

shortcutController.delete = function (req, res, next) {
    var condition = {id: req.params.id};

    Shortcut.delete(condition, function (err, data) {
        if (err) return next(err);

        if (data.type === 0) {
            SocketAdapter.shortcuts('DELETE', _.pick(data, ['id', 'shortcut', 'msg']), function (result) {

            });
        }

        return res.json({code: 200, msg: 'success delete'});
    });
};

shortcutController.list = function (req, res, next) {
    var csid = req.params.csid || '';

    var condition = getCondition(csid);

    var order = [['shortcut', 'ASC']];
    if (req.query.sortField) order = [[req.query.sortField, req.query.sortOrder === 'ascend' ? 'ASC' : 'DESC']];

    Shortcut.listAndCount(condition, order, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

shortcutController.listAll = function (req, res, next) {
    var csid = req.params.csid || '';

    if (!csid) return res.json({code: 9000, msg: 'csid_null'});

    var condition = {
        $or: [
            getCondition(''),
            getCondition(csid)
        ]
    };
    var attributes = ['id', 'type', 'shortcut', 'msg'];

    Shortcut.listAll(attributes, condition, function (err, data) {
        if (err) return next(err);

        // remove repeat shortcut
        var msg = _.uniqBy(_.orderBy(data, ['type'], ['desc']), 'shortcut');

        // remove property:type
        msg = _.map(msg, function (item) {
            return _.omit(item, 'type');
        });

        // sort by shortcut
        msg = _.orderBy(msg, ['shortcut'], ['asc']);

        return res.json({code: 200, msg: msg});
    });
};

shortcutController.checkCount = function (req, res, next) {
    var csid = req.params.csid || '';

    var condition = getCondition(csid);

    Shortcut.count(condition, function (err, data) {
        if (err) return next(err);

        if (data - 30 >= 0) return res.json({code: 9003, msg: 'shortcut_exceed'});

        return next();
    });
};

function getCondition(csid) {
    return {
        type: csid ? 1 : 0,
        csid: csid
    };
}