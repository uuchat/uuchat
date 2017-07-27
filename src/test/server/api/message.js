"use strict";

var request = require('request');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');
var baseUrl = require('../../common').baseUrl;
var csMock = require('../mock/customerSuccess');
var customerMock = require('../mock/customerSession');

describe('api', function () {

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

    describe('#message', function () {

        describe('POST /messages/customer/:cid/cs/customer:csid', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/messages/customer/' + cid + '/cs/' + csid,
                    form: {message: 'hello'}
                }, function (err, res) {
                    assert.ifError(err);
                    var message = JSON.parse(res.body);
                    assert.equal(message.code, 200);
                    mid = message.msg.uuid;
                    done();
                });
            });
        });

        describe('GET /messages/customer/:cid/cs/customer:csid', function () {
            it('should response with object list', function (done) {
                request.get(baseUrl + '/messages/customer/' + cid + '/cs/' + csid, function (err, res) {
                    assert.ifError(err);
                    var message = JSON.parse(res.body);
                    assert.equal(message.code, 200);
                    done();
                });
            });
        });

        /*describe('POST /messages/customer/:cid/cs/:csid/image', function () {
            it('should response with success', function (done) {
                var formData = {
                    // Pass data via Streams
                    image: fs.createReadStream(__dirname + '/../../../client/static/images/contact.png')
                };
                request.post({
                    url: baseUrl + '/messages/customer/' + cid + '/cs/' + csid + '/image',
                    formData: formData
                }, function (err, res) {
                    assert.ifError(err);
                    var message = JSON.parse(res.body);
                    assert.equal(message.code, 200);
                    done();
                });
            });
        });*/

        describe('GET /messages/:uuid', function () {
            it('should response with message data', function (done) {
                request.get(baseUrl + '/messages/' + mid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /messages/customer/:cid', function () {
            it('should response with message data', function (done) {
                request.get(baseUrl + '/messages/customer/' + cid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('DELETE /messages/:uuid', function () {
            it('should response with message data', function (done) {
                request.delete(baseUrl + '/messages/' + mid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

    });
});