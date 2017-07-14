"use strict";

var _ = require('lodash');
var models = require('../models');
var logger = require('../logger');

var Offline = module.exports;

Offline.findById = function (uuid, callback) {

    models.Offline.findById(uuid).then(function (data) {

        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};

Offline.create = function (offline, callback) {

    models.Offline.create(offline).then(function (data) {

        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};


Offline.updateStatusByUUID = function (status, csid, uuid, fn) {
    models.Offline.update({'status': status, 'csid': csid}, {fields: ['status', 'csid'], 'where': {'uuid': uuid}})
        .then(function () {
            fn(true);
        })
        .catch(function (err) {
            logger.error(err);
            fn(false);
        });
};

Offline.update = function (offline, condition, callback) {

    models.Offline.update(offline, {where: condition}).then(function (data) {

        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};

Offline.delete = function (condition, callback) {

    models.Offline.destroy({where: condition}).then(function (data) {

        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};

Offline.listPending = function (callback) {
    var condition = {};
    condition.status = 0;
    this.list(condition, null, null, null, function (err, data) {
        if (err) return;
        callback(data);
    });
};

Offline.list = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    models.Offline.findAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {

        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};

Offline.listAndCount = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    models.Offline.findAndCountAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {

        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};

Offline.Count = function (options, callback) {

    options = options || {};

    models.Offline.count(options).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};
