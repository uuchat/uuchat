"use strict";

var logger = require('./logger'),
    utils = require('./utils'),
    _ = require('lodash'),
    authentication = require('./services/authentication'),
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

Emailer.invited = function (email, callback) {
    var name = nconf.get("app:name");
    var domain = utils.getDomain();
    var from = nconf.get('mail:auth:user');
    var sessionBase64 = authentication.generateInvitation(email);

    //"MTUxNjA2ODU1OTQ0MHxkZnZwbnNAZ21haWwuY29tfEZvMVFIQUlJaC9ObUNvYUwvOEhxNnkxZmdIUEtaTzB6eXdwYStHT29GUTg9";

    // setup email data with unicode symbols
    var mailOptions = {
        to: email,
        subject: 'Welcome',
        html: '<p>' + name + ' is using UUChat to provide customer service, ' +
        'please click on the link below to activate your account.</p>' +
        '<p><a href=\"' + domain + '/register/' + sessionBase64 + '\">Click here to activate your account</a></p>' +
        '<p><b>No idea what UUChat is?</b> <a href=\"https://github.com/uuchat/uuchat\">UUChat</a> is a fully open source, hackable platform for building and running ' +
        'a modern online customer service system. UUChat hope to provide a compact and convenient and efficient ' +
        'customer service system.</p>' +
        '<p>If you have trouble activating your account, you can reach out to <a href=\"mailto:' + from + '\">' + from + '</a>for assistance.</p>' +
        '<p>Have fun, and good luck!</p>'
    };

    Emailer.send(mailOptions, callback);
};