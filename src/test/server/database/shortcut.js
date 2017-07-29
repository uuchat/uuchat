"use strict";

var assert = require('assert');
var models = require('../mock/models');
var CS = require('../../../server/database/customerSuccess');
var Shortcut = require('../../../server/database/shortcut');

describe('database', function () {
    var csid;

    before(function (done) {
        CS.create({email: 'cs@gmail.com', passwd: 'pass123'}, function (err, data) {
            csid = data.csid;
            done();
        });
    });

    after(function (done) {
        CS.delete({csid: csid}, function () {
            done();
        });
    });

    describe('#shortcut', function () {
        var sid;

        describe('create', function () {
            it('should return new object', function (done) {
                var shortcut = {
                    csid: csid,
                    type: csid ? 1 : 0,
                    shortcut: 'hello',
                    msg: 'Hello, welcome to uuchat.What is your problem?'
                };
                Shortcut.create(shortcut, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    sid = data.uuid;
                    done();
                });
            });
        });

        describe('update', function () {
            it('should return a number list of update records', function (done) {
                Shortcut.update({shortcut: 'hi'}, {uuid: sid}, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('findById', function () {
            it('should return object', function (done) {
                Shortcut.findById(sid, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });

        describe('listAndCount', function () {
            it('should return a object with count and list of shortcut object', function (done) {
                Shortcut.listAndCount({uuid: sid}, null, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(data.count, 1);
                    assert(Array.isArray(data.rows));
                    done();
                });
            });
        });

        describe('listAll', function () {
            it('should return a list of shortcut object', function (done) {
                Shortcut.listAll(null, {csid: csid}, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('findAll', function () {
            it('should return a list of shortcut object', function (done) {
                Shortcut.findAll(null, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });


        describe('delete', function () {
            it('should return number of delete', function (done) {
                Shortcut.delete({uuid: sid}, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(arguments.length, 2);
                    assert.strictEqual(data, 1);
                    done();
                });
            });
        });
    });
});