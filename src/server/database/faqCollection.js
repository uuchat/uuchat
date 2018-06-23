"use strict";

var _ = require('lodash');
var models = require('../models');

var FAQCollection = module.exports;

FAQCollection.findById = function (uuid, callback) {

    models.FAQCollection.findById(uuid).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};

FAQCollection.create = function (faqCollection, callback) {

    models.FAQCollection.create(faqCollection).then(function (data) {

        return callback(null, models.getPlainObject(data));

    }, function (err) {

        return callback(err);
    });
};

FAQCollection.update = function (faqCollection, condition, callback) {

    models.FAQCollection.update(faqCollection, {where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};

FAQCollection.delete = function (condition, callback) {

    models.FAQCollection.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};

FAQCollection.listAndCount = function (condition, order, callback) {

    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.FAQCollection.findAndCountAll(filter).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};

FAQCollection.listAll = function (attributes, condition, callback) {

    var order = [['createdAt', 'ASC']];

    models.FAQCollection.findAll({
        attributes: attributes,
        where: condition,
        order: order
    }).then(function (data) {

        return callback(null, models.getPlainArray(data));

    }, function (err) {

        return callback(err);
    });
};

FAQCollection.findAll = function (condition, order, callback) {
    order = order || [['createdAt', 'DESC']];

    var filter = {
        where: condition,
        order: order
    };

    models.FAQCollection.findAll(filter).then(function (data) {

        return callback(null, models.getPlainArray(data));

    }, function (err) {

        return callback(err);
    });
};