"use strict";

var request = require('request');
var baseUrl = require('../../common').baseUrl;

exports.create = function (callback) {
    request.post({
        url: baseUrl + '/register',
        form: {email: 'xxx@gmail.com', passwd: 'pass123'}
    }, function (err, res) {
        callback(res);
    });
};

exports.delete = function (csid, callback) {
    request.delete({
        url: baseUrl + '/customersuccesses/' + csid
    }, function (err, res) {
        callback();
    });
};