const { Sequelize } = require('sequelize');

const mysql = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// 测试连接是否成功
(async () => {
    try {
        await mysql.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

// 将连接对象暴露出去
module.exports = mysql;
