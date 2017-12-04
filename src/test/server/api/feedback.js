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

    describe('#feedback', function () {
        describe('POST /feedbacks/class/:classid', function () {
            var classid = 'network';

            describe('request is normal', function () {
                it('should response with success', function (done) {
                    request.post({
                        url: baseUrl + '/feedbacks/class/' + classid,
                        headers: {
                            'referer': 'http://127.0.0.1:9688/',
                            'origin': 'http://127.0.0.1:9688'
                        },
                        form: {
                            email: 'jian@163.com',
                            feedback: [
                                {key: 'notConnect'},
                                {key: 'others', content: 'App abort.'}
                            ]
                        }
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
    describe('#feedbackmeta', function () {
        describe('POST /feedbackmetas/classes/:classid/page', function () {
            var classid = 'network';

            describe('request is normal', function () {
                it('should response with success', function (done) {
                    request.post({
                        url: baseUrl + '/feedbackmetas/classes/' + classid + '/page',
                        form: {
                            email: 'admin@gmail.com',
                            feedback: [
                                {key: 'notConnect'},
                                {key: 'others', content: 'App abort.'}
                            ]
                        }
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