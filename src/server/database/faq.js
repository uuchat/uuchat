"use strict";

var _ = require('lodash');
var models = require('../models');

var FAQ = module.exports;

FAQ.findById = function (uuid, callback) {

    models.FAQ.findById(uuid).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};

FAQ.create = function (faq, callback) {

    models.FAQ.create(faq).then(function (data) {

        return callback(null, models.getPlainObject(data));

    }, function (err) {

        return callback(err);
    });
};

FAQ.update = function (faq, condition, callback) {

    models.FAQ.update(faq, {where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};

FAQ.delete = function (condition, callback) {

    models.FAQ.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};

FAQ.listAndCount = function (condition, order, callback) {

    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.FAQ.findAndCountAll(filter).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};

FAQ.listAll = function (attributes, condition, callback) {

    attributes = attributes || ['uuid', 'collection_id', 'issue', 'answer'];

    models.FAQ.findAll({
        attributes: attributes,
        where: condition
    }).then(function (data) {

        return callback(null, models.getPlainArray(data));

    }, function (err) {

        return callback(err);
    });
};

FAQ.findAll = function (condition, order, callback) {
    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.FAQ.findAll(filter).then(function (data) {

        return callback(null, models.getPlainArray(data));

    }, function (err) {

        return callback(err);
    });
};

FAQ.aggregate = function (attributes, condition, callback) {

    models.FAQ.findAll({
        attributes: _.concat(attributes, [[models.sequelize.fn('COUNT', 1), 'count']]),
        where: condition,
        group: attributes,
        raw: true
    }).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};