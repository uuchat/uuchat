"use strict";

var nconf = require('nconf');
var _ = require('lodash');
var logger = require('../logger');
var express = require('express');
var controllers = require('../controllers');
var cors = require('cors');

function customerSuccessRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.post('/invite', controllers.customerSuccessController.invite);
    app.post('/invite/resend', controllers.customerSuccessController.reInvite);
    app.post('/register', controllers.customerSuccessController.register);
    app.post('/register/:invited_code', controllers.customerSuccessController.register);
    app.post('/login', controllers.customerSuccessController.login);
    app.post('/logout', controllers.customerSuccessController.logout);
    app.post('/passwdreset', controllers.customerSuccessController.generateResetToken);
    app.put('/passwdreset', controllers.customerSuccessController.resetPasswd);

    app.get('/country', controllers.customerSuccessController.getCountryCode);

    app.patch('/customersuccesses/:csid', controllers.customerSuccessController.update);
    app.delete('/customersuccesses/:csid', controllers.customerSuccessController.delete);
    app.post('/customersuccesses/:csid/avatar', middleware.uploadAvatar,
        controllers.customerSuccessController.uploadAvatar);
    app.get('/customersuccesses/:csid/avatar', controllers.customerSuccessController.getAvatar);

    app.put('/customersuccesses/:csid/passwd', controllers.customerSuccessController.updatePasswd);
    app.put('/customersuccesses/:csid/theme', controllers.customerSuccessController.updateTheme);

    app.get('/customersuccesses', controllers.customerSuccessController.list);
}

function customerSessionRoutes(app, middleware, controllers) {
    //var middlewares = [middleware.checkGlobalPrivacySettings];

    app.post('/customers', controllers.customerSessionController.create);
    app.get('/customers/:uuid', controllers.customerSessionController.get);
    app.get('/customers/cid/:cid', controllers.customerSessionController.query);
    app.patch('/customers/:uuid', controllers.customerSessionController.update);
    app.options('/customers/cid/:cid', cors(middleware.corsOptionsDelegate));
    app.patch('/customers/cid/:cid', cors(middleware.corsOptionsDelegate), controllers.customerSessionController.update);
    app.delete('/customers/:uuid', controllers.customerSessionController.delete);
}

function customerStorageRoutes(app, middleware, controllers) {
    var middlewares = [middleware.getIP, middleware.getCountry];

    app.post('/customerstorages/customer/:cid', middlewares, controllers.customerStorageController.create);
    app.patch('/customerstorages/customer/:cid', middlewares, controllers.customerStorageController.update);

    app.get('/customerstorages', controllers.customerStorageController.list);
    app.get('/customerstorages/:uuid', controllers.customerStorageController.get);
    app.get('/customerstorages/:uuid/screens', controllers.customerStorageController.getScreens);
}

function messageRoutes(app, middleware, controllers) {
    app.get('/messages/:uuid', controllers.messageController.get);
    app.delete('/messages/:uuid', controllers.messageController.delete);
    app.get('/messages/customer/:cid', controllers.messageController.list);
    app.options('/messages/customer/:cid/cs/:csid', cors(middleware.corsOptionsDelegate));
    app.get('/messages/customer/:cid/cs/:csid', cors(middleware.corsOptionsDelegate), controllers.messageController.list);
    app.get('/rnmessages/customer/:cid/cs/:csid', controllers.messageController.list);
    app.get('/messages/customer/:cid/rncs/:csid', controllers.messageController.list);
    app.post('/messages/customer/:cid/cs/:csid', controllers.messageController.create);
    app.post('/messages/customer/:cid/cs/:csid/email', controllers.messageController.replyEmail);

    app.get('/messages/cs/:csid/search', controllers.messageController.search);
    app.get('/messages/cs/:csid/search/latestmonth', controllers.messageController.searchLatestMonth);

    app.options('/messages/customer/:cid/image', cors(middleware.corsOptionsDelegate));
    app.options('/messages/customer/:cid/cs/:csid/image', cors(middleware.corsOptionsDelegate));
    app.post('/messages/customer/:cid/image', cors(middleware.corsOptionsDelegate), middleware.uploadImage);
    app.post('/messages/customer/:cid/cs/:csid/image', cors(middleware.corsOptionsDelegate), middleware.uploadImage);
    app.post('/rnmessages/customer/:cid/cs/:csid/image', middleware.uploadImage);
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
    app.get('/console/chart/chat', controllers.consoleController.getChatData);
    app.get('/console/chart/rate', controllers.consoleController.getRateData);
    app.get('/console/rates/report/month/:month', controllers.consoleController.getMonthlyRateReport);
    app.get('/console/rates/cs/:csid/month/:month', controllers.consoleController.getMonthlyRateList);

    app.post('/console/faqs', controllers.faqController.create);
    app.delete('/console/faqs/:uuid', controllers.faqController.delete);
    app.patch('/console/faqs/:uuid', controllers.faqController.update);
    app.get('/console/faqs/collections', controllers.faqController.getCollectionList);
    app.post('/console/faqs/collections', controllers.faqController.createCollection);
    app.delete('/console/faqs/collections/:collection_id', controllers.faqController.deleteCollection);
    app.patch('/console/faqs/collections/:collection_id', controllers.faqController.updateCollection);
    app.get('/console/faqs/collection/:collection_id', controllers.faqController.getFAQList);
}

function shortcutRoutes(app, middleware, controllers) {
    app.get('/shortcuts', controllers.shortcutController.list);
    app.post('/shortcuts', controllers.shortcutController.checkCount, controllers.shortcutController.create);
    app.patch('/shortcuts/:id', controllers.shortcutController.patch);
    app.delete('/shortcuts/:id', controllers.shortcutController.delete);
    app.get('/shortcuts/cs/:csid', controllers.shortcutController.list);
    app.get('/shortcuts/cs/:csid/all', controllers.shortcutController.listAll);
}

function feedbackRoutes(app, middleware, controllers) {
    app.post('/feedbacks/class/:classid', cors(middleware.corsOptionsDelegate), controllers.feedbackController.create);
    app.get('/feedbacks', controllers.feedbackController.list);
    app.get('/feedbackmetas', controllers.feedbackMetaController.list);
    app.get('/feedbackmetas/classes', controllers.feedbackMetaController.getClassList);
    app.post('/feedbackmetas/classes/:classid/page', controllers.feedbackMetaController.createPage);
    app.post('/feedbackmetas/classes/:classid/properties', controllers.feedbackMetaController.createProperty);
}

function faqRoutes(app, middleware, controllers) {
    app.get('/faqs/collections', controllers.faqController.getCollections);
    app.get('/faqs/collection/:collection_id/issues', controllers.faqController.getIssues);
    app.get('/faqs/:uuid/answer', controllers.faqController.getAnswer);
}

module.exports = function (app, middleware, callback) {
    var router = express.Router();

    customerSuccessRoutes(router, middleware, controllers);
    customerSessionRoutes(router, middleware, controllers);
    customerStorageRoutes(router, middleware, controllers);
    messageRoutes(router, middleware, controllers);
    rateRoutes(router, middleware, controllers);
    chatHistoryRoutes(router, middleware, controllers);
    consoleRoutes(router, middleware, controllers);
    shortcutRoutes(router, middleware, controllers);
    feedbackRoutes(router, middleware, controllers);
    faqRoutes(router, middleware, controllers);

    router.get('/test', function (req, res, next) {
        return res.status(200).json({code: 200, msg: 'test successful'});
    });

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