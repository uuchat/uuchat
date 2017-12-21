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

            describe('request is normal', function () {
                it('should response with success', function (done) {
                    request.post({
                        url: baseUrl + '/offlines',
                        form: {cid: cid, name: 'jian', email: 'test@gmail.com', content: 'offline body'}
                    }, function (err, res) {
                        assert.ifError(err);
                        var data = JSON.parse(res.body);
                        assert.equal(data.code, 200);
                        done();
                    });
                });
            });

            describe('request_name is null', function () {
                it('should response code 8000', function (done) {
                    request.post({
                        url: baseUrl + '/offlines',
                        form: {cid: cid, name: '', email: 'test@gmail.com', content: 'co'}
                    }, function (err, res) {
                        assert.ifError(err);
                        var data = JSON.parse(res.body);
                        assert.equal(data.code, 8000);
                        done();
                    });
                });
            });

            describe('request_email is error', function () {
                it('should response code 8001', function (done) {
                    request.post({
                        url: baseUrl + '/offlines',
                        form: {cid: cid, name: 'jian', email: 'email', content: 'co'}
                    }, function (err, res) {
                        assert.ifError(err);
                        var data = JSON.parse(res.body);
                        assert.equal(data.code, 8001);
                        done();
                    });
                });
            });

            describe('request_content is null', function () {
                it('should response code 8002', function (done) {
                    request.post({
                        url: baseUrl + '/offlines',
                        form: {cid: cid, name: 'jian', email: 'test@gmail.com', content: ''}
                    }, function (err, res) {
                        assert.ifError(err);
                        var data = JSON.parse(res.body);
                        assert.equal(data.code, 8002);
                        done();
                    });
                });
            });

            describe('Length of request_content is more than 256', function () {
                it('should response code 8002', function (done) {
                    var content = 'a'.repeat(258);
                    request.post({
                        url: baseUrl + '/offlines',
                        form: {cid: cid, name: 'jian', email: 'test@gmail.com', content: content}
                    }, function (err, res) {
                        assert.ifError(err);
                        var data = JSON.parse(res.body);
                        assert.equal(data.code, 8002);
                        done();
                    });
                });
            });

        });

        describe('POST /offlines/:uuid/reply', function () {
            // how to get ?
            var uuid='';

            describe('request is normal', function () {
                it('should response with success', function (done) {
                    request.post({
                        url: baseUrl + '/offlines/' + uuid + '/reply',
                        form: {content: 'reply'}
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
});