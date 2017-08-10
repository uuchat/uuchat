"use strict";

var supportedLocales = ['en'];
var _ = require('lodash');
var fs = require('fs');
var chalk = require('chalk');
var MessageFormat = require('intl-messageformat');
var currentLocale = 'en';

var blos, I18n;

I18n = {
    t: function t(path, bindings) {
        var string = I18n.findString(path), msg;

        if (_.isArray(string)) {
            msg = [];
            string.forEach(function (s) {
                var m = new MessageFormat(s, currentLocale);

                msg.push(m.format(bindings));
            });
        } else {
            msg = new MessageFormat(string, currentLocale);
            msg = msg.format(bindings);
        }

        return msg;
    },

    findString: function findString(msgPath) {
        var matchingString, path;
        if (_.isEmpty(msgPath) || !_.isString(msgPath)) {
            chalk.yellow('i18n:t() - received an empty path.');
            return '';
        }

        if (blos === undefined) {
            I18n.init();
        }

        matchingString = blos;

        path = msgPath.split('.');
        path.forEach(function (key) {
            matchingString = matchingString[key] || null;
        });

        if (_.isNull(matchingString)) {
            console.error('Unable to find matching path [' + msgPath + '] in locale file.\n');
            matchingString = 'i18n error: path "' + msgPath + '" was not found.';
        }

        return matchingString;
    },

    init: function init() {
        blos = fs.readFileSync(__dirname + '/translations/' + currentLocale + '.json');

        try {
            blos = JSON.parse(blos);
        } catch (err) {
            blos = undefined;
            throw err;
        }

        if (global.Intl) {
            var hasBuiltInLocaleData,
                IntlPolyfill;

            hasBuiltInLocaleData = supportedLocales.every(function (locale) {
                return Intl.NumberFormat.supportedLocalesOf(locale)[0] === locale &&
                    Intl.DateTimeFormat.supportedLocalesOf(locale)[0] === locale;
            });

            if (!hasBuiltInLocaleData) {
                IntlPolyfill = require('intl');
                Intl.NumberFormat = IntlPolyfill.NumberFormat;
                Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
            }
        } else {
            global.Intl = require('intl');
        }
    }
};

module.exports = I18n;
