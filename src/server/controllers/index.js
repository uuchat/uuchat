"use strict";

const fs = require("fs");
const path = require("path");
const logger = require('../logger');

const Controllers = module.exports;

Controllers.init = ()=> {
    fs.readdirSync(__dirname)
        .filter((file) => (file.indexOf(".") !== 0) && (file !== "index.js"))
        .forEach((file) => {
            const subController = require(path.join(__dirname, file));
            const subControllerName = file.substring(0, file.lastIndexOf('.'));

            Controllers[subControllerName] = subController;
        });

    // support chain ops
    return Controllers;
};

// init Controllers
Controllers.init();