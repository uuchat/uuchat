'use strict';


const REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl) {
    let raw = Object
        .keys(process.env)
        .filter(key => REACT_APP.test(key))
        .reduce((env, key) => {
            env[key] = process.env[key];
            return env;
        }, {
            'NODE_ENV': process.env.NODE_ENV || 'development',
            'PUBLIC_URL': publicUrl,
            'reactMinJS': "<%- reactMinJS %>",
            'reactDomMinJS': "<%- reactDomMinJS %>",
            'socketIO': "<%- socketIO %>",
            'momentMinJS': "<%- momentMinJS %>"
        });
    let stringFiled = {
        'process.env': Object
            .keys(raw)
            .reduce((env, key) => {
                env[key] = JSON.stringify(raw[key]);
                return env;
            }, {})
    };

    return {raw, stringFiled};
}

module.exports = getClientEnvironment;
