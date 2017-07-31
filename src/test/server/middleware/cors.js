"use strict";

var request = require('request');
var assert = require('assert');
var fs = require('fs');
var common = require('../../common');
var csMock = require('../mock/customerSuccess');
var customerMock = require('../mock/customerSession');

var baseUrl = common.baseUrl;
var localUrl = common.localUrl;

describe('middleware', function () {

    var cid, csid, mid;

    before(function (done) {
        csMock.create(function (res) {
            var data = JSON.parse(res.body);
            csid = data.msg.csid;
            done();
        });
    });

    before(function (done) {
        customerMock.create(function (res) {
            var customer = JSON.parse(res.body);
            cid = customer.msg.cid;
            done();
        });
    });

    after(function (done) {
        csMock.delete(csid, done);
    });

    after(function (done) {
        customerMock.delete(cid, done);
    });

    describe('#cros', function () {
        describe('##POST /messages/customer/:cid/cs/:csid/image', function () {
            describe(baseUrl, function () {
                it('should response with success', function (done) {
                    var formData = {
                        // Pass data via Streams
                        image: fs.createReadStream(__dirname + '/../../../client/static/images/contact.png')
                    };
                    request.post({
                        url: baseUrl + '/messages/customer/' + cid + '/cs/' + csid + '/image',
                        headers:{
                            referer: baseUrl
                        },
                        formData: formData
                    }, function (err, res) {
                        assert.ifError(err);
                        var message = JSON.parse(res.body);
                        assert.equal(message.code, 2001);
                        done();
                    });
                });
            });
            describe(localUrl, function () {
                it('should response with success', function (done) {
                    var formData = {
                        // Pass data via Streams
                        image: fs.createReadStream(__dirname + '/../../../client/static/images/contact.png')
                    };
                    request.post({
                        url: localUrl + '/messages/customer/' + cid + '/cs/' + csid + '/image',
                        headers:{
                            referer: localUrl
                        },
                        formData: formData
                    }, function (err, res) {
                        assert.ifError(err);
                        var message = JSON.parse(res.body);
                        assert.equal(message.code, 200);
                        done();
                    });
                });
            });
        });
    });
});