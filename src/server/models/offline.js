"use strict";

module.exports = function (sequelize, DataTypes) {
    var Offline = sequelize.define("Offline",
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            name: DataTypes.STRING(64),
            cid: {
                type: DataTypes.STRING(64),
                defaultValue: ''
            },
            email: {
                type: DataTypes.STRING(128),
                validate: {
                    isEmail: true
                }
            },
            content: DataTypes.STRING(512),
            status: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: '0: pending，1: processing， 2: finished'
            },
            csid: {
                type: DataTypes.STRING(64),
                defaultValue: ''
            }
        }, {
            tableName: 'offline',
            indexes: [
                {
                    fields: ['status']
                },
                {
                    fields: ['csid', 'status']
                }
            ]
        });

    return Offline;
};