/**
 * Created by jianzhiqiang on 2017/5/11.
 */
"use strict";

var nconf = require('nconf');
var winston = require('winston');
var express = require('express');
var controllers = require('../controllers');

function customerSuccessRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.post('/register', controllers.customerSuccessController.register);
    app.post('/login', controllers.customerSuccessController.login);
    app.post('/logout', controllers.customerSuccessController.logout);

    app.patch('/customersuccesses/:csid', controllers.customerSuccessController.update);
    app.delete('/customersuccesses/:csid', controllers.customerSuccessController.delete);
    app.post('/customersuccesses/:csid/avatar', middleware.upload.uploadAvatar,
        controllers.customerSuccessController.uploadAvatar);
    app.get('/customersuccesses/:csid/avatar', controllers.customerSuccessController.getAvatar);
    app.put('/customersuccesses/:csid/passwd', controllers.customerSuccessController.updatePasswd);

    app.get('/customersuccesses', controllers.customerSuccessController.list);
}

function customerSessionRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.post('/customers', controllers.customerSessionController.create);
    app.get('/customers/:uuid', controllers.customerSessionController.get);
    app.get('/customers/cid/:cid', controllers.customerSessionController.query);
    app.patch('/customers/:uuid', controllers.customerSessionController.update);
    app.patch('/customers/cid/:cid', controllers.customerSessionController.update);
    app.delete('/customers/:uuid', controllers.customerSessionController.delete);
}

function messageRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.get('/messages', controllers.messageController.search);
    app.get('/messages/:uuid', controllers.messageController.get);
    app.delete('/messages/:uuid', controllers.messageController.delete);
    app.get('/messages/customer/:cid', controllers.messageController.list);
    app.get('/messages/customer/:cid/cs/:csid', controllers.messageController.list);
    app.post('/messages/customer/:cid/cs/:csid', controllers.messageController.create);
    app.post('/messages/customer/:cid/cs/:csid/image', middleware.upload.uploadImage,
        controllers.customerSessionController.checkMonthlyUploadSize);
}

function rateRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.post('/rates', controllers.rateController.create);
    app.get('/rates/report', controllers.rateController.report);
    app.get('/rates/:uuid', controllers.rateController.get);
    app.patch('/rates/:uuid', controllers.rateController.patch);
    app.delete('/rates/:uuid', controllers.rateController.delete);
    app.get('/rates/customer/:cid', controllers.rateController.list);
    app.get('/rates/customersuccess/:csid', controllers.rateController.list);
}

function offlineRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.post('/offlines', controllers.offlineController.create);

}

function chatHistoryRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.get('/chathistories', controllers.chatHistoryController.search);
    app.get('/chathistories/cs/:csid', controllers.chatHistoryController.list);
    app.post('/chathistories/cs/:csid/customer/:cid', controllers.chatHistoryController.create);
    app.get('/chathistories/cs/:csid/latestmonth', controllers.chatHistoryController.getLatestMonthChats);
}


function consoleRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.post('/console/login', controllers.customerSuccessController.loginConsole);
    app.get('/console/numbers', controllers.consoleController.getNumbers);
}

module.exports = function (app, middleware, callback) {
    var router = express.Router();

    /* if (global.env === 'production') {
     router.use(middleware.checksum);
     }*/

    customerSuccessRoutes(router, middleware, controllers);
    customerSessionRoutes(router, middleware, controllers);
    messageRoutes(router, middleware, controllers);
    rateRoutes(router, middleware, controllers);
    offlineRoutes(router, middleware, controllers);
    chatHistoryRoutes(router, middleware, controllers);
    consoleRoutes(router, middleware, controllers);

    router.use(function (err, req, res, next) {
        winston.error(err);
        res.status(500).json({code: 500, msg: 'internal server error'});
    });

    app.use('/', router);

    winston.info('Routes added');
};