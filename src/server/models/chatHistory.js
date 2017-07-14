"use strict";

module.exports = function (sequelize, DataTypes) {
    var ChatHistory = sequelize.define("ChatHistory",
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
            marked: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: 'color marked'
            }
        }, {
            tableName: 'chat_history',
            indexes: [
                {
                    fields: ['cid', 'csid']
                }
            ]
        });

    return ChatHistory;
};