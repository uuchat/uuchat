"use strict";

var request = require('request');
var baseUrl = require('../../common').baseUrl;

exports.create = function (callback) {
    request.post({
        url: baseUrl + '/customers',
        form: {url: 'uuchat.com', email:'test@gmail.com'}
    }, function (err, res) {
        callback(res);
    });
};

exports.delete = function (cid, callback) {
    request.delete({
        url: baseUrl + '/customers/' + cid
    }, function (err, res) {
        callback();
    });
};