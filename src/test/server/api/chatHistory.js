"use strict";

var request = require('request');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');
var baseUrl = require('../../common').baseUrl;
var csMock = require('../mock/customerSuccess');
var customerMock = require('../mock/customerSession');

describe('api', function () {
    var cid, csid;

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

    describe('#chatHistory', function () {

        describe('POST /chathistories/cs/:csid/customer/:cid', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/chathistories/cs/' + csid + '/customer/' + cid,
                    form: {}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /chathistories/cs/:csid', function () {
            it('should response with list', function (done) {
                request.get(baseUrl + '/chathistories/cs/' + csid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /chathistories/cs/:csid/latestmonth', function () {
            it('should response with message data', function (done) {
                request.get(baseUrl + '/chathistories/cs/' + csid + '/latestmonth', function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });
    });
});