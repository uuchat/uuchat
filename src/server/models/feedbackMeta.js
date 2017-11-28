"use strict";

module.exports = function (sequelize, DataTypes) {
    var FeedbackMeta = sequelize.define("FeedbackMeta",
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            class: {
                type: DataTypes.STRING(128),
                defaultValue: ''
            },
            desc: DataTypes.STRING(256),
            type: DataTypes.INTEGER
        }, {
            tableName: 'feedback_meta',
            indexes: [
                {
                    fields: ['class']
                }
            ]
        });

    return FeedbackMeta;
};