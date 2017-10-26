"use strict";

var request = require('request');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');
var baseUrl = require('../../common').baseUrl;
var customerMock = require('../mock/customerSession');

describe('api', function () {
    var cid;

    before(function (done) {
        customerMock.create(function (res) {
            var customer = JSON.parse(res.body);
            cid = customer.msg.cid;
            done();
        });
    });

    after(function (done) {
        customerMock.delete(cid, done);
    });

    describe('#customerStorage', function () {

        describe('POST /customerstorages/customer/:cid', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/customerstorages/customer/' + cid,
                    form: {
                        firstTime: 1505725960559,
                        timezone: +8,
                        firstScreen: 'http://localhost:18080/add',
                        lastScreen: 'http://localhost:18080/add',
                        language: 'zh_CN'
                    }
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    console.log(data);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('PATCH /customerstorages/customer/:cid', function () {
            it('should response with success', function (done) {
                request.patch({
                    url: baseUrl + '/customerstorages/customer/' + cid,
                    form: {
                        lastTime: 1505725960559,
                        chatTime: 1505725960559,
                        lastScreen: 'http://localhost:18080/add'
                    }
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    console.log(data);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

    });
});