"use strict";

var request = require('request');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');

var baseUrl = require('../../common').baseUrl;

describe('api', function () {

    var csid;

    describe('#customerSuccess', function () {

        describe('POST /register', function () {
            it('should response with json', function (done) {
                request.post({
                    url: baseUrl + '/register',
                    form: {email: 'xxx@gmail.com', passwd: 'pass123'}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    csid = data.msg.csid;
                    done();
                });
            });
        });

        describe('POST /login', function () {
            it('should response with json', function (done) {
                request.post({
                    url: baseUrl + '/login',
                    form: {email: 'xxx@gmail.com', passwd: 'pass123'}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('POST /logout', function () {
            it('should response with json', function (done) {
                request.post({
                    url: baseUrl + '/logout',
                    form: {email: 'xxx@gmail.com', passwd: 'pass123'}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('POST /passwdreset', function () {
            it('should response with json', function (done) {
                request.post({
                    url: baseUrl + '/passwdreset',
                    form: {email: 'j60017268@gmail.com'}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('PATCH /customersuccesses/:csid', function () {
            it('should response with json', function (done) {
                request.patch({
                    url: baseUrl + '/customersuccesses/' + csid,
                    form: {name: 'suse'}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('POST /customersuccesses/:csid/avatar', function () {
            it('should response with success', function (done) {
                var formData = {
                    // Pass data via Streams
                    avatars: fs.createReadStream(__dirname + '/../../../client/static/images/contact.png')
                };
                request.post({
                    url: baseUrl + '/customersuccesses/' + csid + '/avatar',
                    formData: formData
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /customersuccesses/:csid/avatar', function () {
            it('should response with success', function (done) {
                request.get(baseUrl + '/customersuccesses/' + csid + '/avatar', function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('PUT /customersuccesses/:csid/passwd', function () {
            it('should response with success', function (done) {
                request.put({
                    url: baseUrl + '/customersuccesses/' + csid + '/passwd',
                    form: {passwd: 'resetpasswd'}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('PUT /customersuccesses/:csid/theme', function () {
            it('should response with success', function (done) {
                request.put({
                    url: baseUrl + '/customersuccesses/' + csid + '/theme',
                    form: {background: 'red', opacity: 0.2}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('DELETE /customersuccesses/:csid', function () {
            it('should response with json', function (done) {
                request.delete({
                    url: baseUrl + '/customersuccesses/' + csid
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