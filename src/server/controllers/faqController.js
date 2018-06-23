"use strict";

var async = require('async');
var _ = require('lodash');
var FAQ = require('../database/faq');
var FAQCollection = require('../database/faqCollection');
var utils = require('../utils');

var faqController = module.exports;

faqController.get = function (req, res, next) {

    FAQ.findById(req.params.uuid, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

faqController.getCollections = function (req, res, next) {
    var attributes = ['collection_id'];
    var condition = {};

    FAQ.aggregate(attributes, condition, function (err, rows) {
        if (err) return next(err);

        attributes = ['uuid', 'name', 'createdAt'];

        FAQCollection.listAll(attributes, condition, function (err, data) {
            if (err) return next(err);

            var collections = rows.map(function (row) {

                var filters = data.filter(function (item) {
                    return row.collection_id === item.uuid;
                });

                row.collection = filters.length ? filters[0]['name'] : '';
                row.createdAt = filters.length ? filters[0]['createdAt'] : '';

                return _.pick(row, ['collection_id', 'collection', 'createdAt']);
            });

            collections = _.orderBy(collections, ['createdAt'], ['asc']);

            return res.json({code: 200, msg: collections});
        });
    });
};

faqController.getIssues = function (req, res, next) {
    var attributes = ['uuid', 'issue'];
    var condition = {collection_id: req.params.collection_id};

    if (!condition.collection_id) return res.json({code: 9000, msg: 'collection_id_null'});

    FAQ.listAll(attributes, condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

faqController.getAnswer = function (req, res, next) {

    if (!req.params.uuid) return res.json({code: 9001, msg: 'uuid_null'});

    FAQ.findById(req.params.uuid, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data ? data.answer : ''});
    });
};

faqController.getCollectionList = function (req, res, next) {
    var attributes = ['uuid', 'name', 'createdAt'];
    var condition = {};

    FAQCollection.listAll(attributes, condition, function (err, rows) {
        if (err) return next(err);

        attributes = ['collection_id'];

        FAQ.aggregate(attributes, condition, function (err, data) {
            if (err) return next(err);

            var collections = rows.map(function (row) {
                row.count = 0;

                var filters = data.filter(function (item) {
                    return item.collection_id === row.uuid;
                });

                if (filters.length) row.count = filters[0].count;

                return row;
            });

            collections = _.orderBy(collections, ['createdAt'], ['asc']);

            return res.json({code: 200, msg: collections});
        });
    });
};

faqController.getFAQList = function (req, res, next) {
    var attributes = ['uuid', 'issue', 'answer'];

    var condition = {collection_id: req.params.collection_id};

    if (!condition.collection_id) return res.json({code: 9000, msg: 'collection_id_null'});

    FAQ.listAll(attributes, condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

faqController.create = function (req, res, next) {
    var faq = {
        collectionId: req.body.collectionId,
        issue: req.body.issue,
        answer: req.body.answer
    };

    if (!faq.collectionId) return res.json({code: 9002, msg: 'collection_id_null'});
    if (!faq.issue) return res.json({code: 9003, msg: 'issue_null'});
    if (!faq.answer) return res.json({code: 9004, msg: 'answer_null'});

    FAQ.create(faq, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

faqController.createCollection = function (req, res, next) {
    var collection = {name: req.body.name};

    if (!collection.name) return res.json({code: 9001, msg: 'collection name null'});

    FAQCollection.create(collection, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

faqController.update = function (req, res, next) {
    var faq = {};
    var condition = {uuid: req.params.uuid};

    if (req.body.issue) faq.issue = req.body.issue;
    if (req.body.answer) faq.answer = req.body.answer;

    FAQ.update(faq, condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success_update'});
    });
};


faqController.updateCollection = function (req, res, next) {
    var collection = {name: req.body.name};
    var condition = {uuid: req.params.collection_id};

    FAQCollection.update(collection, condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success_update'});
    });
};

faqController.delete = function (req, res, next) {
    var condition = {uuid: req.params.uuid};

    FAQ.delete(condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success delete'});
    });
};

faqController.deleteCollection = function (req, res, next) {
    var collection = {uuid: req.params.collection_id};

    if (!collection.uuid) return res.json({code: 9001, msg: 'collection_id_null'});

    FAQCollection.delete(collection, function (err, data) {
        if (err) return next(err);

        var faq = {collection_id: req.params.collection_id};

        FAQ.delete(faq, function (err, data) {
            if (err) return next(err);

            return res.json({code: 200, msg: 'success delete'});
        });
    });
};

faqController.list = function (req, res, next) {
    var condition = {};

    if (req.query.collection) condition.collection = req.query.collection;

    var order = [['createdAt', 'DESC']];

    FAQ.listAndCount(condition, order, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};