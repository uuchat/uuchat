"use strict";

var assert = require('assert');
var models = require('../mock/models');
var Customer = require('../../../server/database/customerSession');
var CS = require('../../../server/database/customerSuccess');
var ChatHistory = require('../../../server/database/chatHistory');

describe('database', function () {
    var cid, csid;

    before(function (done) {
        CS.create({email: 'cs@gmail.com', passwd: 'pass123'}, function (err, data) {
            csid = data.csid;
            done();
        });
    });

    before(function (done) {
        Customer.insert({url: 'uuchat.com'}, function (err, data) {
            cid = data.cid;
            done();
        });
    });

    after(function (done) {
        CS.delete({csid: csid}, function () {
            done();
        });
    });

    after(function (done) {
        Customer.delete({cid: cid}, function () {
            done();
        });
    });

    describe('#chatHistory', function () {
        var chid;

        describe('create', function () {
            it('should return new object', function (done) {
                var chatHistory = {
                    cid: cid,
                    csid: csid,
                    marked: 0
                };
                ChatHistory.insert(chatHistory, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    chid = data.uuid;
                    done();
                });
            });
        });

        describe('createOrUpdate', function () {
            it('should return a boolean value', function (done) {
                ChatHistory.createOrUpdate(cid, csid, function (data) {
                    assert(data);
                    done();
                });
            });
        });

        describe('updateMarked', function () {
            it('should return boolean value', function (done) {
                ChatHistory.updateMarked(cid, csid, 2, function (data) {
                    assert(data);
                    done();
                });
            });
        });

        describe('findById', function () {
            it('should return object', function (done) {
                ChatHistory.findById(chid, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });

        describe('findOne', function () {
            it('should return object', function (done) {
                ChatHistory.findOne({uuid: chid}, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });


        describe('count', function () {
            it('should return number of chatHistory in database', function (done) {
                ChatHistory.count({where: {uuid: chid}}, function (err, number) {
                    assert.ifError(err);
                    assert.strictEqual(number, 1);
                    done();
                });
            });
        });

        describe('list', function () {
            it('should return a list of chatHistory object', function (done) {
                ChatHistory.list({uuid: chid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('listAndCount', function () {
            it('should return a object with count and list of chatHistory object', function (done) {
                ChatHistory.listAndCount({uuid: chid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(data.count, 1);
                    assert(Array.isArray(data.rows));
                    done();
                });
            });
        });

        describe('delete', function () {
            it('should return number of delete', function (done) {
                ChatHistory.delete({uuid: chid}, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(arguments.length, 2);
                    assert.strictEqual(data, 1);
                    done();
                });
            });
        });
    });
});