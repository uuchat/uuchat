"use strict";

var _ = require('lodash');
var models = require('../models');
var logger = require('../logger');

var Feedback = module.exports;

Feedback.findById = function (uuid, callback) {

    models.Feedback.findById(uuid).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Feedback.create = function (feedback, callback) {

    models.Feedback.create(feedback).then(function (data) {
        var pureData = data.get({plain: true});

        return callback(null, pureData);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Feedback.update = function (feedback, condition, callback) {

    models.Feedback.update(feedback, {where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Feedback.delete = function (condition, callback) {

    models.Feedback.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Feedback.listAndCount = function (condition, order, callback) {

    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.Feedback.findAndCountAll(filter).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Feedback.listAll = function (attributes, condition, callback) {

    attributes = attributes || ['class', 'email', 'feedback'];

    models.Feedback.findAll({
        attributes: attributes,
        where: condition
    }).then(function (data) {

        var pureData = _.map(data, function (item) {
            return item.get({plain: true});
        });

        return callback(null, pureData);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Feedback.findAll = function (condition, order, callback) {
    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.Feedback.findAll(filter).then(function (data) {

        var pureData = _.map(data, function (item) {
            return item.get({plain: true});
        });

        return callback(null, pureData);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};