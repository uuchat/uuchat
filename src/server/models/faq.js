"use strict";

module.exports = function (sequelize, DataTypes) {
    var FAQ = sequelize.define("FAQ",
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            collectionId: {
                type: DataTypes.STRING(32),
                field: 'collection_id',
                allowNull: false
            },
            issue: {
                type: DataTypes.STRING(64),
                allowNull: false
            },
            answer: {
                type: DataTypes.STRING(255),
                defaultValue: ''
            }
        }, {
            tableName: 'faq',
            indexes: [
                {
                    fields: ['collection_id']
                }
            ]
        });

    return FAQ;
};