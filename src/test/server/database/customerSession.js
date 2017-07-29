"use strict";

var assert = require('assert');
var models = require('../mock/models');
var Customer = require('../../../server/database/customerSession');

describe('database', function () {

    describe('#customer', function () {
        var cid;

        describe('create', function () {
            it('should return new object', function (done) {
                var customer = {url: 'uuchat.com'};
                Customer.insert(customer, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    cid = data.uuid;
                    done();
                });
            });
        });

        describe('update', function () {
            it('should return a number list of update records', function (done) {
                Customer.update({name: 'customer', ip: '127.0.0.1'}, {cid: cid}, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('findById', function () {
            it('should return object', function (done) {
                Customer.findById(cid, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });

        describe('findOne', function () {
            it('should return object', function (done) {
                Customer.findOne({cid: cid}, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });

        describe('list', function () {
            it('should return a list of customer object', function (done) {
                Customer.list({uuid: cid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('listAndCount', function () {
            it('should return a object with count and list of customer object', function (done) {
                Customer.listAndCount({uuid: cid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(data.count, 1);
                    assert(Array.isArray(data.rows));
                    done();
                });
            });
        });

        describe('delete', function () {
            it('should return number of delete', function (done) {
                Customer.delete({uuid: cid}, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(arguments.length, 2);
                    assert.strictEqual(data, 1);
                    done();
                });
            });
        });
    });
});