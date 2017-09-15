"use strict";

module.exports = function (sequelize, DataTypes) {
    var CustomerSession = sequelize.define("CustomerSession",
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
            ip: {
                type: DataTypes.STRING(64),
                validate: {
                    isIP: true
                }
            },
            name: DataTypes.STRING(32),
            email: {
                type: DataTypes.STRING(128),
                validate: {
                    isEmail: true
                }
            },
            photo: DataTypes.STRING(128),
            browser: DataTypes.STRING(32),
            version: {
                type: DataTypes.STRING(32),
                comment: 'browser version'
            },
            marked: {
                type: DataTypes.INTEGER,
                comment: 'color marked'
            },
            platform: DataTypes.STRING(64),
            os: DataTypes.STRING(64),
            systemName: {
                type: DataTypes.STRING(32),
                comment: 'eg:windows10, maxOS12.12',
                field: 'system_name'
            },
            device: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: '0: web, 1: iOS, 2: Android'
            },
            url: DataTypes.STRING(128),
            upload: DataTypes.STRING(21)
        }, {
            tableName: 'customer_session',
            indexes: [{fields: ['cid']}]
        });

    return CustomerSession;
};