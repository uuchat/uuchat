"use strict";

var constants = module.exports;

constants.feedback = {
    network: [
        {key: 'notConnect', desc: "Can't connect", type: 0},
        {key: 'forbidSites', desc: "Connected,but can't access sites/apps", type: 1},
        {key: 'speedSlow', desc: "Speed is too slow", type: 0},
        {key: 'disConnect', desc: "Auto-disconnected", type: 0},
        {key: 'serverProblem', desc: "Servers are full/sleepy", type: 0},
        {key: 'others', desc: "Others", type: 1}
    ]
};