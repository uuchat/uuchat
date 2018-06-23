"use strict";

var async = require('async');
var _ = require('lodash');
var Feedback = require('../database/feedback');
var FeedbackMeta = require('../database/feedbackMeta');
var utils = require('../utils');

var feedbackController = module.exports;

feedbackController.get = function (req, res, next) {

    Feedback.findById(req.params.uuid, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

feedbackController.create = function (req, res, next) {

    if (!req.body.feedback) return res.json({code: 9001, msg: 'no feedback'});

    try {

        var feedback = {
            class: req.params.classid,
            email: req.body.email,
            name: req.body.name,
            feedback: JSON.parse(req.body.feedback)
        };

        async.waterfall([
            function (next) {
                if (feedback.class === 'contact_us') return next();

                /* will be optimize sql query */
                async.each(feedback.feedback, function (item, callback) {
                    FeedbackMeta.findById(item.id, function (err, data) {
                        if (err) callback(err);

                        item.desc = data.desc;
                        callback();
                    });
                }, function (err) {
                    if (err) next(err);

                    feedback.feedback = feedback.feedback.map(function (item) {
                        return _.pick(item, ['desc', 'content']);
                    });

                    next();
                });
            }
        ], function (err) {
            if (err) return next(err);

            Feedback.create(feedback, function (err, data) {
                if (err) return next(err);

                return res.json({code: 200, msg: 'success submit'});
            });
        });

    } catch (err) {
        if (err) return next(err);
    }
};

feedbackController.delete = function (req, res, next) {
    var condition = {id: req.params.id};

    Feedback.delete(condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success delete'});
    });
};

feedbackController.list = function (req, res, next) {
    var condition = {};

    if(req.query.class){
        condition.class = req.query.class;
    }

    var order = [['createdAt', 'DESC']];

    Feedback.listAndCount(condition, order, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};