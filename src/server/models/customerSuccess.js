"use strict";

module.exports = function (sequelize, DataTypes) {
    var CustomerSuccess = sequelize.define("CustomerSuccess",
        {
            csid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            name: DataTypes.STRING(64),
            displayName: {
                type: DataTypes.STRING(128),
                    field: 'display_name'
            },
            email: {
                type: DataTypes.STRING(128),
                validate: {
                    isEmail: true
                }
            },
            passwd: DataTypes.STRING(64),
            photo: DataTypes.STRING(128),
            timezone: {
                type: DataTypes.INTEGER,
                defaultValue: -5
            }
        }, {
            tableName: 'customer_success',
            indexes: [
                {
                    fields: ['email'],
                    unique: true
                }
            ]
        });

    return CustomerSuccess;
};