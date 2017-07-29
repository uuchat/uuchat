"use strict";

var request = require('request');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');
var customerMock = require('../mock/customerSession');
var baseUrl = require('../../common').baseUrl;

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

    describe('#offline', function () {

        describe('POST /offlines', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/offlines',
                    form: {cid: cid, name: 'jian', email: 'j60017268@gmail.com', content: 'test'}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

    });
});