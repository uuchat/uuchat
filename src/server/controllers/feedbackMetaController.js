"use strict";

var async = require('async');
var _ = require('lodash');
var FeedbackMeta = require('../database/feedbackMeta');
var utils = require('../utils');
var ejs = require('ejs');
var fs = require('fs');
var path = require('path');

var feedbackMetaController = module.exports;

feedbackMetaController.get = function (req, res, next) {

    FeedbackMeta.findById(req.params.uuid, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

feedbackMetaController.create = function (req, res, next) {
    var feedbackMeta = {
        class: req.body.class || '',
        desc: req.body.desc,
        type: req.body.type
    };

    if (!feedbackMeta.feedback) return res.json({code: 9001, msg: 'feedback_null'});

    FeedbackMeta.create(feedbackMeta, function (err, data) {
        if (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                return res.json({
                    code: 9002, msg: 'feedbackmeta_already_used'
                });
            }
            return next(err);
        }

        return res.json({code: 200, msg: data});
    });
};

feedbackMetaController.delete = function (req, res, next) {
    var condition = {id: req.params.id};

    FeedbackMeta.delete(condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success_delete'});
    });
};

feedbackMetaController.list = function (req, res, next) {

    // search feedback meta options.
    var attributes = null;

    async.waterfall([
        function (callback) {
            FeedbackMeta.listAll(attributes, {class: ''}, callback);
        },
        function (data, callback) {
            if (data && data.length) return callback(null, data[0]);
            // Init feedback meta
            FeedbackMeta.create({desc: 'network'}, callback);
        },
        function (classData, callback) {
            // no feedback meta data
            if (!classData) return callback();

            FeedbackMeta.listAll(attributes, {class: classData.desc}, function (err, data) {
                if (err) return callback(err);

                return callback(null, {
                    classid: classData.desc,
                    properties: data
                });
            });
        }
    ], function (err, result) {
        if (err) return next(err);

        if (!result) return res.json({code: 9003, msg: 'no_data'});
        return res.json({code: 200, msg: result});
    });
};

feedbackMetaController.getClassList = function (req, res, next) {

    // search feedback meta options.
    var attributes = ['desc'];

    var condition = {class: ''};

    FeedbackMeta.listAll(attributes, condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

feedbackMetaController.createProperty = function (req, res, next) {
    var feedbackMeta = {
        class: req.params.classid,
        desc: req.body.desc,
        type: parseInt(req.body.type)
    };

    FeedbackMeta.create(feedbackMeta, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

feedbackMetaController.createPage = function (req, res, next) {
    var classid = req.params.classid;
    var checkedProperties = req.body.checkedProperties;

    if (!classid || !checkedProperties) {
        return res.status(400).json({code: 400, msg: 'params_null'});
    }
    var properties = [];
    try {
        properties = JSON.parse(checkedProperties);
    } catch (e) {
        if (err) return next(err);
    }
    var feedbackMetaStructure = {
        classid: classid,
        properties: properties
    };

    var templateFile = path.resolve('src/client/views/customer', 'feedBack.html');
    var fileName = 'feedback/' + feedbackMetaStructure.classid + '.html';
    var staticPageFile = path.resolve('content/html', fileName);

    ejs.renderFile(templateFile, feedbackMetaStructure, function (err, str) {
        if (err) return next(err);

        fs.writeFile(staticPageFile, str, function (err) {
            if (err) return next(err);

            return res.json({code: 200, msg: {url: '/public/' + fileName}});
        });
    });
};