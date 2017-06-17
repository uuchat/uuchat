/**
 * Created by jianzhiqiang on 2017/5/11.
 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    var Message = sequelize.define("Message",
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            cid: {
                type: DataTypes.STRING(64),
                allowNull: false
            },
            csid: DataTypes.STRING(64),
            msg: DataTypes.STRING(512),
            type: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: '0: user message, 1: admin message, 2: offline message, ' +
                            '3: dispatch message, 4: user offline message'
            },
            device: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: '0: web, 1: iOS, 2: Android'
            }
        }, {
            tableName: 'message',
            indexes: [
                {
                    fields: ['cid', 'csid']
                }
            ]
        });

    return Message;
};