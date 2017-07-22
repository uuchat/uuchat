"use strict";

module.exports = function (sequelize, DataTypes) {
    var Shortcut = sequelize.define("Shortcut",
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            csid: {
                type: DataTypes.STRING(64),
                defaultValue: ''
            },
            shortcut: DataTypes.STRING(64),
            msg: DataTypes.STRING(512),
            type: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: '0:system set;1:user set'
            }
        }, {
            tableName: 'shortcut',
            indexes: [
                {
                    fields: ['type', 'csid', 'shortcut'],
                    unique: true
                }
            ]
        });

    return Shortcut;
};