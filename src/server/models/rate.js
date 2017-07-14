"use strict";

module.exports = function (sequelize, DataTypes) {
    var Rate = sequelize.define("Rate",
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
            rate: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            ip: {
                type: DataTypes.STRING(64),
                validate: {
                    isIP: true
                }
            }
        }, {
            tableName: 'rate'
        });

    return Rate;
};