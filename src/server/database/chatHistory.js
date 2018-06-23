"use strict";

var _ = require('lodash');
var models = require('../models');
var logger = require('../logger');

var ChatHistory = module.exports;

ChatHistory.findById = function (uuid, callback) {

    models.ChatHistory.findById(uuid).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

ChatHistory.findOne = function (condition, callback) {

    models.ChatHistory.findOne({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

ChatHistory.createOrUpdate = function (cid, csid, fn) {
    var chatHistory = {};
    chatHistory.cid = cid;
    chatHistory.csid = csid;

    models.ChatHistory.findOne({where: {cid: cid, csid: csid}}).then(function (data) {
        if (data) {
            return models.ChatHistory.update({'updatedAt': new Date()}, {
                fields: ['updatedAt'],
                'where': {'uuid': data.uuid}
            }).then(function () {

                return fn(true);

            }, function (err) {

                logger.error(err);

                return fn(false);
            });
        } else {
            return models.ChatHistory.create(chatHistory).then(function (data) {

                return fn(true);

            }, function (err) {

                logger.error(err);

                return fn(false);
            });
        }
    }, function (err) {

        logger.error(err);

        return fn(false);
    });
};


ChatHistory.updateMarked = function (cid, csid, marked, fn) {

    models.ChatHistory.update({'marked': marked}, {fields: ['marked'], 'where': {'cid': cid, 'csid': csid}})
        .then(function () {

            fn(true);

        }, function (err) {

            logger.error(err);

            fn(false);
        });
};

ChatHistory.insert = function (chatHistory, callback) {

    models.ChatHistory.create(chatHistory).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

ChatHistory.delete = function (condition, callback) {

    models.ChatHistory.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

ChatHistory.list = function (condition, order, pageSize, pageNum, callback) {
    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    return models.ChatHistory.findAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

ChatHistory.listAndCount = function (condition, order, pageSize, pageNum, callback) {
    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    return models.ChatHistory.findAndCountAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

ChatHistory.count = function (options, callback) {

    options = options || {};

    models.ChatHistory.count(options).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

ChatHistory.findAll = function (options, callback) {

    options = options || {};

    models.ChatHistory.findAll(options).then(function (data) {

        return callback(null, models.getPlainArray(data));
    }, function (err) {

        return callback(err);
    });
};