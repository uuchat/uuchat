"use strict";

var logger = require('./logger'),
    nconf = require('nconf');
    //nodemailer = require('nodemailer'),

var Emailer = module.exports;

Emailer.send = function (mailOptions, callback) {

    var settings = nconf.get('mail');

    var nodemailer = require('nodemailer');

    var transport = nodemailer.createTransport(settings);

    // setup email data with unicode symbols
    /*mailOptions = {
        from: 'xxx@gmail.com', // sender address
        to: 'xxx@gmail.com', // list of receivers
        subject: 'Hello', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>' // html body
    };*/

    transport.sendMail(mailOptions, callback);
};