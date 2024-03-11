const sequelize = require("../sql");
const {
    DataTypes
} = require('sequelize');

const Plan = sequelize.define('Plan', {
    planId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    planName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    planConfigs: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "{}"
    }
}, {
});

Plan.sync({ alter: true });

module.exports = Plan;