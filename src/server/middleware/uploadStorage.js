"use strict";

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var nconf = require('nconf');
var sharp = require('sharp');
var sizeOf = require('image-size');
var utils = require('../utils');
var _ = require('lodash');

var UploadStorage = module.exports;

UploadStorage.avatarStorage = function (opts) {

    function getFilename(req, file, cb) {
        cb(null, req.params.csid + path.extname(file.originalname).toLowerCase());
    }

    function getDestination(req, file, cb) {
        var path = UploadStorage.getSavePath(nconf.get('avatars:savePath'));
        cb(null, path);
    }

    function AvatarStorage(opts) {
        opts = opts || {};

        this.getFilename = (opts.filename || getFilename);

        if (typeof opts.destination === 'string') {
            utils.mkdir(opts.destination);
            this.getDestination = function ($0, $1, cb) {
                cb(null, opts.destination);
            };
        } else {
            this.getDestination = (opts.destination || getDestination);
        }
    }

    AvatarStorage.prototype._handleFile = function _handleFile(req, file, cb) {
        var that = this;

        that.getDestination(req, file, function (err, destination) {
            if (err) return cb(err);

            that.getFilename(req, file, function (err, filename) {
                if (err) return cb(err);

                var finalPath = path.join(destination, filename);

                var resizeStream = sharp().resize(nconf.get('avatars:width'), nconf.get('avatars:height'));
                var outStream = fs.createWriteStream(finalPath);

                file.stream.pipe(resizeStream).pipe(outStream);

                outStream.on('error', cb);
                outStream.on('finish', function () {
                    cb(null, {
                        destination: destination,
                        filename: filename,
                        path: finalPath,
                        size: outStream.bytesWritten
                    });
                });
            });
        });
    };

    AvatarStorage.prototype._removeFile = function _removeFile(req, file, cb) {
        var path = file.path;

        delete file.destination;
        delete file.filename;
        delete file.path;

        fs.unlink(path, cb);
    };

    return new AvatarStorage(opts);
};

UploadStorage.imageStorage = function (opts) {
    function getFilename(req, file, cb) {
        var originalName = file.originalname;

        var arr = originalName.split('.');
        var suffix = arr.pop().toLowerCase();
        var name = utils.md5(arr.join('.') + '-' + Date.now());
        var filename = name + '.' + suffix;

        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(new Error('crypto-name-has-error'));

            var resizeFilename = raw.toString('hex') + '.' + suffix;

            cb(null, {destFilename: filename, resizeFilename: resizeFilename});
        });
    }

    function getDestination(req, file, cb) {
        var path = UploadStorage.getSavePath(nconf.get('images:savePath'));
        cb(null, path);
    }

    function ImageStorage(opts) {
        opts = opts || {};

        this.getFilename = (opts.filename || getFilename);

        if (typeof opts.destination === 'string') {
            mkdir(opts.destination);
            this.getDestination = function ($0, $1, cb) {
                cb(null, opts.destination);
            };
        } else {
            this.getDestination = (opts.destination || getDestination);
        }
    }

    ImageStorage.prototype._handleFile = function _handleFile(req, file, cb) {
        var that = this;

        that.getDestination(req, file, function (err, destination) {
            if (err) return cb(err);

            that.getFilename(req, file, function (err, filename) {
                if (err) return cb(err);

                var destPath = path.join(destination, filename.destFilename);
                var resizePath = path.join(destination, filename.resizeFilename);
                var outStream = fs.createWriteStream(destPath);

                file.stream.pipe(outStream);
                outStream.on('error', cb);
                outStream.on('finish', function () {
                    // can improve
                    var dimensions = sizeOf(destPath);
                    var width = dimensions.width;
                    var height = dimensions.height;
                    var resizeWidth = nconf.get('images:width'), resizeHeight = nconf.get('images:height');
                    if (width >= height) {
                        resizeHeight = resizeWidth * height / width;
                    } else {
                        resizeWidth = resizeHeight * width / height;
                    }

                    resizeWidth = Math.ceil(resizeWidth);
                    resizeHeight = Math.ceil(resizeHeight);

                    var fileProperties = {
                        destination: destination,
                        filename: filename.destFilename,
                        resizeFilename: filename.resizeFilename,
                        path: destPath,
                        resizePath: resizePath,
                        size: outStream.bytesWritten,
                        resizeWidth: resizeWidth,
                        resizeHeight: resizeHeight
                    };
                    // resize image
                    resizeImage(fileProperties, function (err, result) {
                        cb(err, fileProperties);
                    });
                });
            });
        });
    };

    ImageStorage.prototype._removeFile = function _removeFile(req, file, cb) {
        var path = file.path;
        var resizePath = file.resizePath;

        delete file.destination;
        delete file.filename;
        delete file.resizeFilename;
        delete file.path;
        delete file.resizePath;

        fs.unlink(path, function (err) {
            if (err) cb(err);

            fs.unlink(resizePath, cb);
        });
    };

    function resizeImage(options, callback) {
        var message = {
            type: 'resizeImage',
            options: _.pick(options, ['path', 'resizePath', 'resizeWidth', 'resizeHeight'])
        };

        forkResizeImage(message, callback);
    }

    var fork = require('child_process').fork;
    var forkProcessParams = {};
    if (global.v8debug || parseInt(process.execArgv.indexOf('--debug'), 10) !== -1) {
        forkProcessParams = {execArgv: ['--debug=' + (5859), '--nolazy']};
    }

    var child = fork(path.join(__dirname, 'resizer'), [], forkProcessParams);

    function forkResizeImage(message, callback) {
        child.once('message', function (msg) {
            if (msg.err) return callback(new Error(msg.err));

            callback(null, msg.result);
        });

        child.send(message);
    }

    return new ImageStorage(opts);
};

UploadStorage.getSavePath = function (basePath) {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var monthDir = path.join(basePath, month + '');
    var dayDir = path.join(monthDir, day + '');
    utils.mkdir(monthDir);
    utils.mkdir(dayDir);
    return dayDir;
};

UploadStorage.imageFilter = function (req, file, next) {
    var fileTypes = /jpeg|jpg|png|gif/;
    var mimeType = fileTypes.test(file.mimetype);
    var extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) return next(null, true);

    var err = new Error("only supports file type:" + fileTypes);
    err.code = 'FORBID_FILE_TYPE';
    next(err);
};