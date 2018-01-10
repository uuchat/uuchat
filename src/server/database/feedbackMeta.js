"use strict";

var _ = require('lodash');
var models = require('../models');
var logger = require('../logger');

var FeedbackMeta = module.exports;

FeedbackMeta.findById = function (uuid, callback) {

    models.FeedbackMeta.findById(uuid).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

FeedbackMeta.create = function (feedbackMeta, callback) {

    models.FeedbackMeta.create(feedbackMeta).then(function (data) {

        return callback(null, models.getPlainObject(data));

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

FeedbackMeta.update = function (feedbackMeta, condition, callback) {

    models.FeedbackMeta.update(feedbackMeta, {where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

FeedbackMeta.delete = function (condition, callback) {

    models.FeedbackMeta.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

FeedbackMeta.listAndCount = function (condition, order, callback) {

    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.FeedbackMeta.findAndCountAll(filter).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

FeedbackMeta.listAll = function (attributes, condition, callback) {

    models.FeedbackMeta.findAll({
        attributes: attributes,
        where: condition
    }).then(function (data) {

        return callback(null, models.getPlainArray(data));

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

FeedbackMeta.findAll = function (condition, order, callback) {
    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.FeedbackMeta.findAll(filter).then(function (data) {

        return callback(null, models.getPlainArray(data));

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};