/**
 * Created by jianzhiqiang on 2017/5/11.
 */
"use strict";

var server = require('../../index');
var models = require('../../server/models');
var request = require('request');
var should = require('chai').should();
var nconf = require('nconf');
var fs = require('fs');

describe('controllers', function () {

    describe('#upload', function () {
        describe('POST /messages/customer/:cid/cs/:csid/image', function () {
            it('should response with success', function (done) {
                var formData = {
                    // Pass data via Streams
                    image: fs.createReadStream(__dirname + '/../../client/static/images/user_avatar.png')
            };
                request.post({
                    url: 'http://127.0.0.1:9688' + '/messages/customer/cid/cs/csid/image',
                    formData: formData
                }, function (err, res) {
                    should.not.exist(err);
                    var customer = JSON.parse(res.body);
                    customer.code.should.equal(200);
                    done();
                });
            });
        });
    });
});