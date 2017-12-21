"use strict";

var winston = require('winston');
var _ = require('lodash');
var async = require('async');
var nconf = require('nconf');
var multer = require('multer');
var UploadStorage = require('./uploadStorage');
var logger = require('../logger');
var customerSession = require('../database/customerSession');

module.exports = function (middleware) {
    var imageUpload = multer({
        storage: UploadStorage.imageStorage(),
        limits: {fileSize: nconf.get('images:fileSize')},
        fileFilter: UploadStorage.imageFilter
    });

    middleware.uploadImage = function (req, res, next) {
        var condition = {cid: req.params.cid};
        var who = req.query.f;

        async.waterfall([
            function (next) {
                customerSession.findOne(condition, next);
            },
            function (customer, next) {
                checkMonthFileSize(customer, req, next);
            },
            function (next) {
                imageUpload.single('image')(req, res, function (err) {
                    if (err) return next(new Error('upload-file-has-error'));

                    if (!_.isUndefined(who)) { // only update customer
                        req.monthlyUploadSize = getYearMonth() + ',' + (parseInt(req.file.size) + parseInt(req.lastUploadSize));
                        updateMonthSize(req);
                    }

                    next(null, {
                        code: 200,
                        msg: {
                            original: req.file.path,
                            resized: req.file.resizePath,
                            w: req.file.resizeWidth,
                            h: req.file.resizeHeight
                        }
                    });
                });
            }
        ], function (err, result) {
            if (!err) return res.json(result);

            logger.error(err);

            switch (err.message) {
                case 'customer-not-found':
                    res.json({code: 5001, msg: err.message});
                    break;
                case 'exceed-monthly-max-size':
                    res.json({code: 5002, msg: err.message});
                    break;
                case 'upload-file-has-error':
                    res.json({code: 5003, msg: err.message});
                    break;
                case 'crypto-name-has-error':
                    logger.error(err);
                    break;
                case 'resize-file-has-error':
                    res.json({code: 5005, msg: err.message});
                    break;
                case 'upload-file-name-undefined':
                    res.json({code: 5006, msg: err.message});
                    break;
                default:
                    res.json({code: 5010, msg: err.message});
                    break;
            }
        });
    };

    var avatarUpload = multer({
        storage: UploadStorage.avatarStorage(),
        limits: {fileSize: nconf.get('images:fileSize')},
        fileFilter: UploadStorage.imageFilter
    });

    middleware.uploadAvatar = avatarUpload.single('avatars');

    function checkMonthFileSize(customer, req, next) {
        if (!customer) return next(new Error('customer-not-found'));
        var yearMonth = getYearMonth();
        var monthlyUploadSize = 0;
        var uploadArray;

        if (customer.upload) {
            uploadArray = customer.upload.split(',');
            monthlyUploadSize = uploadArray[1];
            if (uploadArray[0] !== yearMonth) {
                monthlyUploadSize = 0;
            }
        }

        if (monthlyUploadSize - nconf.get("images:monthlyMaxSize") > 0) {
            return next(new Error('exceed-monthly-max-size'));
        }

        req.lastUploadSize = monthlyUploadSize;
        req.uploadCacheUUID = customer.uuid;

        next();
    }

    function updateMonthSize(req) {
        var monthlyUploadSize = req.monthlyUploadSize;
        var upload = {upload: monthlyUploadSize};
        var condition = {uuid: req.uploadCacheUUID};

        setImmediate(function () {
            customerSession.update(upload, condition, function (err, data) {
                if (err) logger.error(err);
            });
        });
    }

    function getYearMonth() {
        var now = new Date();
        var mm = now.getMonth() + 1;
        return [now.getFullYear(), (mm > 9 ? '' : '0') + mm].join('');
    }
};
