"use strict";

var request = require('request');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');
var baseUrl = require('../../common').baseUrl;
var csMock = require('../mock/customerSuccess');
var customerMock = require('../mock/customerSession');

describe('api', function () {

    var cid, csid, rid;

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

    describe('#rate', function () {

        describe('POST /rates/', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/rates',
                    form: {cid: cid, csid: csid, rate: 80}
                }, function (err, res) {
                    assert.ifError(err);
                    var rate = JSON.parse(res.body);
                    assert.equal(rate.code, 200);
                    rid = rate.msg.uuid;
                    done();
                });
            });
        });

        describe('GET /rates/report', function () {
            it('should response with rate data', function (done) {
                request.get(baseUrl + '/rates/report', function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /rates/:uuid', function () {
            it('should response with rate data', function (done) {
                request.get(baseUrl + '/rates/' + rid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /rates/customer/:cid', function () {
            it('should response with rate data', function (done) {
                request.get(baseUrl + '/rates/customer/' + cid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /rates/customersuccess/:csid', function () {
            it('should response with rate data', function (done) {
                request.get(baseUrl + '/rates/customersuccess/' + csid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('PATCH /rates/:uuid', function () {
            it('should response with success info', function (done) {
                request.patch({
                    url: baseUrl + '/rates/' + rid,
                    form: {rate: 90}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('DELETE /rates/:uuid', function () {
            it('should response with rate data', function (done) {
                request.delete(baseUrl + '/rates/' + rid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });
    });

});