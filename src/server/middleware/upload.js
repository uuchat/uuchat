"use strict";

var winston = require('winston');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var async = require('async');
var nconf = require('nconf');
var multer = require('multer');
var sharp = require('sharp');
var crypto = require('crypto');

var logger = require('../logger');
var utils = require('../utils');

var EMC = {
    'EXCEED_MONTHLY_MAX_SIZE': 5000,
    'LIMIT_FILE_SIZE': 5001,
    'FORBID_FILE_TYPE': 5002
};

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var path = getSavePath(nconf.get('images:savePath'));
        cb(null, path);
    },
    filename: function (req, file, cb) {
        winston.info(file);
        cb(null, getFileName(file));
    }
});

var upload = multer({
    storage: storage,
    limits: {fileSize: nconf.get('images:fileSize')},
    fileFilter: function (req, file, next) {

        var fileTypes = /jpeg|jpg|png|gif/;
        var mimeType = fileTypes.test(file.mimetype);
        var extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) return next(null, true);

        var err = new Error("only supports file type:" + fileTypes);
        err.code = 'FORBID_FILE_TYPE';
        next(err);
    }
});

function uploadImage(req, res, next) {
    //res.header("Access-Control-Allow-Origin", "*");
    //res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    async.waterfall([
        function(next){
            upload.single('image')(req, res, function (err) {
                if (err) {
                    logger.error(err);
                    next(new Error('upload-file-has-error'));
                }
                var fileName = req.file.filename;
                if (_.isUndefined(fileName)) {
                    next(new Error('upload-file-name-undefined'));
                }
                var originalname = req.file.originalname;
                next(null, fileName, originalname);
            });
        },
        function(fileName, originalname, next){
            crypto.pseudoRandomBytes(16, function (err, raw) {
                if (err) {
                    logger.error(err);
                    next(new Error('crypto-name-has-error'))
                }

                var original = path.join(getSavePath(nconf.get('images:savePath')), fileName);
                var dest = path.join(getSavePath(nconf.get('images:savePath')),
                                    raw.toString('hex') + path.extname(originalname).toLowerCase());
                next(null, original, dest);
            });
        },
        function(original, dest, next){
            var sizeOf = require('image-size');
            var dimensions = sizeOf(original);
            var width = dimensions.width;
            var height = dimensions.height;
            var resizeWidth = nconf.get('images:width'), resizeHeight = nconf.get('images:height');
            if (width >= height) {
                resizeHeight = resizeWidth * height / width;
            } else {
                resizeWidth = resizeHeight * width / height;
            }

            winston.info(original);

            sharp(original)
                .resize(Math.ceil(resizeWidth), Math.ceil(resizeHeight))
                .toFile(dest, function (err, inf) {
                    if (err) {
                        logger.error(err);
                        next(new Error('resize-file-has-error'));
                    }
                    next(null, {code: 200, msg: {original: original, resized: dest}});
                }
            );
        }
    ], function (err, result) {
        if (err) {
            switch (err.message) {
                case 'upload-file-has-error':
                    winston.error(err.message);
                    res.json({code: 5003, msg: err.message});
                    break;
                case 'crypto-name-has-error':
                    winston.error(err.message);
                    res.json({code: 5004, msg: err.message});
                    break;
                case 'resize-file-has-error':
                    winston.error(err.message);
                    res.json({code: 5005, msg: err.message});
                    break;
                case 'upload-file-name-undefined':
                    winston.error(err.message);
                    res.json({code: 5006, msg: err.message});
                    break;
                default:
                    winston.error(err);
                    res.json({code: 5010, msg: err.message});
                    break;
            }
        }
        res.json(result);
    });
}

function uploadAvatar(req, res, next) {
    upload.single('avatars')(req, res, function (err) {
        var file = req.file;
        if (err) {
            logger.error(err);
            next(new Error('upload-file-has-error'));
        }
        var fileName = req.file.filename;
        var original = path.join(getSavePath(nconf.get('images:savePath')), fileName);

        var fileTypes = path.extname(file.originalname).toLowerCase();
        var dest = path.join(getSavePath(nconf.get('avatars:savePath')), req.params.csid + fileTypes);

        sharp(original)
            .resize(nconf.get('avatars:width'), nconf.get('avatars:height'))
            .toFile(dest, function (err, inf) {
                if (err) return next(err);
                file.path = dest;
                //delete original file;
                fs.unlinkSync(original);
                next();
            }
        );

    });
}

function getFileName(file) {
    var arr = file.originalname.split('.');
    var suffix = arr.pop();
    var name = utils.md5(arr.join('.') + '-' + Date.now());
    winston.info(name + '.' + suffix);
    return name + '.' + suffix;
}

function getSavePath(basePath){
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var monthDir = path.join(basePath, month + '');
    var dayDir = path.join(monthDir, day + '');
    mkdir(monthDir);
    mkdir(dayDir);
    return dayDir;
}

function mkdir(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdir(dir);
    }
}


module.exports = function (middleware) {
    middleware.upload = {};
    middleware.upload.uploadAvatar = uploadAvatar;
    middleware.upload.uploadImage = uploadImage;
};