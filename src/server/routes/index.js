"use strict";

var nconf = require('nconf');
var _ = require('lodash');
var logger = require('../logger');
var express = require('express');
var controllers = require('../controllers');
var cors = require('cors');

function customerSuccessRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.post('/register', controllers.customerSuccessController.register);
    app.post('/login', controllers.customerSuccessController.login);
    app.post('/logout', controllers.customerSuccessController.logout);

    app.get('/country', controllers.customerSuccessController.getCountryCode);

    app.patch('/customersuccesses/:csid', controllers.customerSuccessController.update);
    app.delete('/customersuccesses/:csid', controllers.customerSuccessController.delete);
    app.post('/customersuccesses/:csid/avatar', middleware.uploadAvatar,
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
    app.get('/messages/:uuid', controllers.messageController.get);
    app.delete('/messages/:uuid', controllers.messageController.delete);
    app.get('/messages/customer/:cid', controllers.messageController.list);
    app.get('/messages/customer/:cid/cs/:csid', controllers.messageController.list);
    app.post('/messages/customer/:cid/cs/:csid', controllers.messageController.create);

    app.get('/messages/cs/:csid/search', controllers.messageController.search);
    app.get('/messages/cs/:csid/search/latestmonth', controllers.messageController.searchLatestMonth);
    app.options('/messages/customer/:cid/cs/:csid/image', cors(middleware.corsOptionsDelegate));
    app.post('/messages/customer/:cid/cs/:csid/image', cors(middleware.corsOptionsDelegate), middleware.uploadImage,
        controllers.customerSessionController.checkMonthlyUploadSize);
}

function rateRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.get('/rates', controllers.rateController.search);
    app.post('/rates', controllers.rateController.create);
    app.get('/rates/:uuid', controllers.rateController.get);
    app.patch('/rates/:uuid', controllers.rateController.patch);
    app.delete('/rates/:uuid', controllers.rateController.delete);
    app.get('/rates/customer/:cid', controllers.rateController.list);
    app.get('/rates/customersuccess/:csid', controllers.rateController.list);
}

function offlineRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.post('/offlines', controllers.offlineController.create);
    app.get('/offlines', controllers.offlineController.create);

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
    app.get('/console/monthly', controllers.consoleController.getMonthlyData);
    app.get('/console/rates/report/month/:month', controllers.consoleController.getMonthlyRateReport);
    app.get('/console/rates/cs/:csid/month/:month', controllers.consoleController.getMonthlyRateList);
}

function shortcutRoutes(app, middleware, controllers){
    app.get('/shortcuts', controllers.shortcutController.list);
    app.post('/shortcuts', controllers.shortcutController.checkCount, controllers.shortcutController.create);
    app.patch('/shortcuts/:uuid', controllers.shortcutController.patch);
    app.delete('/shortcuts/:uuid', controllers.shortcutController.delete);
    app.get('/shortcuts/cs/:csid', controllers.shortcutController.list);
    app.get('/shortcuts/cs/:csid/all', controllers.shortcutController.listAll);
}

module.exports = function (app, middleware, callback) {
    var router = express.Router();

    customerSuccessRoutes(router, middleware, controllers);
    customerSessionRoutes(router, middleware, controllers);
    messageRoutes(router, middleware, controllers);
    rateRoutes(router, middleware, controllers);
    offlineRoutes(router, middleware, controllers);
    chatHistoryRoutes(router, middleware, controllers);
    consoleRoutes(router, middleware, controllers);
    shortcutRoutes(router, middleware, controllers);

    router.use(function (err, req, res, next) {
        logger.error(err);
        switch (err.message) {
            case 'Not allowed by CORS':
                logger.error("cors error");
                res.json({code: 2001, msg: err.message});
                break;
            default:
                res.status(500).json({code: 500, msg: 'internal server error'});
                break;
        }
    });

    app.use('/', router);
};