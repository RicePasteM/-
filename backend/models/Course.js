const sequelize = require("../sql");
const {
    DataTypes
} = require('sequelize');

const Course = sequelize.define('Course', {
    courseId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    courseCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    courseCategory: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    courseName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    courseCredit: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    indexes: []
});

Course.sync({ alter: true });

module.exports = Course;