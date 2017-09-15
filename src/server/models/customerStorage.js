"use strict";

module.exports = function (sequelize, DataTypes) {
    var CustomerStorage = sequelize.define("CustomerStorage",
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            cid: {
                type: DataTypes.STRING(64),
                allowNull: false,
                comment: 'anonymous:cid = uuid'
            },
            firstTime: {
                type: DataTypes.DATE,
                field: 'first_time'
            },
            lastTime: {
                type: DataTypes.DATE,
                field: 'last_time'
            },
            chatTime: {
                type: DataTypes.DATE,
                field: 'chat_time'
            },
            firstScreen: {
                type: DataTypes.STRING(128),
                field: 'first_screen'
            },
            lastScreen: {
                type: DataTypes.STRING(128),
                field: 'last_screen'
            },
            screenList: {
                type: DataTypes.TEXT,
                field: 'screen_list'
            },
            timezone: {
                type: DataTypes.INTEGER,
                defaultValue: -5
            },
            language: DataTypes.STRING(32),
            city: DataTypes.STRING(64),
            country: DataTypes.STRING(64),
            browser: DataTypes.STRING(32),
            bv: {
                type: DataTypes.STRING(32),
                comment: 'browser version'
            },
            os: DataTypes.STRING(64)
        }, {
            tableName: 'customer_storage',
            indexes: [{fields: ['cid']}]
        });

    return CustomerStorage;
};