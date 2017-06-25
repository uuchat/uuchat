'use strict';

//just example
var express = require('express');
var router = express.Router();
var path = require('path');

router.get('*', function(req, res, next) {
    res.render(path.join(__dirname, '../../../build/app.html'));
});


module.exports = router;