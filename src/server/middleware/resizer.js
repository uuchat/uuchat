"use strict";

var fs = require('fs');
var sharp = require('sharp');

process.on('message', function (msg) {
    if (msg.type === 'resizeImage') {
        resizeImage(msg.options, done);
    }
});

function resizeImage(options, callback) {
    var fileStream = fs.ReadStream(options.path);
    var resizeStream = sharp().resize(options.resizeWidth, options.resizeHeight);
    var resizeOutStream = fs.createWriteStream(options.resizePath);

    fileStream.pipe(resizeStream).pipe(resizeOutStream);

    resizeOutStream.on('error', callback);
    resizeOutStream.on('finish', function () {
        callback();
    });
}

function done(err, result) {
    if (err) {
        process.send({err: err.message});
    }else {
        process.send({result: result});
    }
    //process.disconnect();
}
