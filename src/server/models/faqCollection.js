"use strict";

module.exports = function (sequelize, DataTypes) {
    var FAQCollection = sequelize.define("FAQCollection",
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(32),
                allowNull: false
            },
            parent: {
                type: DataTypes.UUID,
                default: ''
            },
            desc: DataTypes.STRING(256)
        }, {
            tableName: 'faq_collection',
            indexes: [
                {
                    fields: ['name']
                }
            ]
        });

    return FAQCollection;
};