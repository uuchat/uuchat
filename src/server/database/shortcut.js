"use strict";

var _ = require('lodash');
var models = require('../models');
var logger = require('../logger');

var Shortcut = module.exports;

Shortcut.findById = function (uuid, callback) {

    models.Shortcut.findById(uuid).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

Shortcut.create = function (shortcut, callback) {

    models.Shortcut.create(shortcut).then(function (data) {
        var pureData = data.get({plain: true});

        return callback(null, pureData);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

Shortcut.update = function (shortcut, condition, callback) {

    models.Shortcut.update(shortcut, {where: condition}).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

Shortcut.delete = function (condition, callback) {

    models.Shortcut.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

Shortcut.listAndCount = function (condition, order, callback) {

    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.Shortcut.findAndCountAll(filter).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

Shortcut.listAll = function (attributes, condition, callback) {

    attributes = attributes || ['type', 'csid', 'shortcut', 'msg'];

    models.Shortcut.findAll({
        attributes: attributes,
        where: condition
    }).then(function (data) {

        var pureData = _.map(data, function (item) {
            return item.get({plain: true});
        });

        return callback(null, pureData);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

Shortcut.findAll = function (condition, order, callback) {
    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.Shortcut.findAll(filter).then(function (data) {

        var pureData = _.map(data, function (item) {
            return item.get({plain: true});
        });

        return callback(null, pureData);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};