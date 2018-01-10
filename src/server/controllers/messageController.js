"use strict";

var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var ejs = require('ejs');
var nconf = require('nconf');
var validator = require('validator');
var Message = require('../database/message');
var utils = require('../utils');
var logger = require('../logger');
var CustomerSession = require('../database/customerSession');
var Email = require('../email');

var messageController = module.exports;

messageController.get = function (req, res, next) {
    Message.findById(req.params.uuid, function (err, message) {
        if (err) return next(err);

        return res.json({code: 200, msg: message});
    });
};

messageController.create = function (req, res, next) {
    var message = {
        cid: req.params.cid,
        csid: req.params.csid,
        msg: req.body.msg,
        type: req.body.type || 0,
        device: req.body.device || 0
    };

    Message.insert(message, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

messageController.list = function (req, res, next) {
    var cid = req.params.cid;
    var csid = req.params.csid;

    var condition = {cid: cid};
    if (csid) condition.csid = csid;

    var order = [['createdAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = utils.parsePositiveInteger(req.query.pageSize) || 20;

    return Message.list(condition, order, pageSize, pageNum, function (err, messages) {
        if (err) return next(err);

        return res.json({code: 200, msg: _.reverse(messages)});
    });
};

messageController.delete = function (req, res, next) {

    var condition = {uuid: req.params.uuid};

    Message.delete(condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success delete'});
    });
};

messageController.search = function (req, res, next) {
    if (!req.query.msg) return res.json({code: 200, msg: []});

    var condition = {
        csid: req.params.csid,
        msg: {
            '$like': '%' + req.query.msg + '%',
            '$notLike': 'content/upload/%'
        }
    };

    var order = [['createdAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 5;

    return Message.search(condition, order, pageSize, pageNum, function (err, messages) {
        if (err) return next(err);

        return res.json({code: 200, msg: messages});
    });
};

messageController.searchLatestMonth = function (req, res, next) {
    if (!req.query.msg) return res.json({code: 200, msg: []});

    var condition = {
        csid: req.params.csid,
        msg: {
            '$like': '%' + req.query.msg + '%',
            '$notLike': 'content/upload/%'
        },
        createdAt: {
            '$gte': moment().subtract(1, 'month')
        }
    };

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 100;

    var order = [['createdAt', 'DESC']];

    return Message.search(condition, order, pageSize, pageNum, function (err, messages) {
        if (err) return next(err);

        return res.json({code: 200, msg: messages});
    });
};

messageController.replyEmail = function (req, res, next) {
    var cid = req.params.cid;
    var csid = req.params.csid;
    var toEmail = req.body.to;
    var subject = req.body.subject;
    var msg = req.body.message;

    if (!validator.isEmail(toEmail || '')) return res.json({code: 4001, msg: 'email_validate_error'});

    var condition = {cid: cid, csid: csid};
    var order = [['createdAt', 'DESC']];
    var pageNum = 0;
    var pageSize = 10;

    Message.list(condition, order, pageSize, pageNum, function (err, messages) {
        if (err) return next(err);

        messages = _.reverse(messages);

        messages.push({cid: cid, csid: csid, type:1, msg: msg, createdAt:new Date()});

        messages.forEach(function(item){
            item.createdAt = moment(item.createdAt).format('DD MMM hh:mm a');
        });

        // setup email data with unicode symbols
        var mailOptions = {};

        //from: '"xxx" xxx@gmail.com', // sender address
        //to: 'xxx@gmail.com', // list of receivers
        //subject: 'Hello ✔', // Subject line
        //text: 'Hello world?', // plain text body
        //html: '<b>Hello world?</b>' // html body

        mailOptions.subject = subject;
        mailOptions.to = toEmail;

        var templateFile = path.resolve('src/client/views/console', 'email_template.html');

        var relativeUrl = '';

        if (nconf.get('app:ssl')) {
            relativeUrl+= 'https';
        }else{
            relativeUrl+= 'http';
        }
        relativeUrl += "://" + nconf.get('app:address') + ':' + nconf.get('app:port') + nconf.get('app:relative_path');

        ejs.renderFile(templateFile, {messages: messages, relativeUrl:relativeUrl}, {cache: true}, function (err, html) {
            if (err) return next(err);

            mailOptions.html = html;

            Email.send(mailOptions, function (err, info) {
                if (err) logger.error(err);
            });

            return res.json({code: 200, msg: 'success_reply_email'});
        });
    });
};