"use strict";

module.exports = function (sequelize, DataTypes) {
    var Feedback = sequelize.define("Feedback",
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            class: DataTypes.STRING(128),
            email: {
                type: DataTypes.STRING(128),
                defaultValue: ''
            },
            name: DataTypes.STRING(128),
            feedback: DataTypes.JSON
        }, {
            tableName: 'feedback',
            indexes: [
                {
                    fields: ['class']
                }
            ]
        });

    return Feedback;
};