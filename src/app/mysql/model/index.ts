const dbConfig = require('../config/config.ts');
const Sequelize = require('sequelize');

const sequelizeConfig = new Sequelize(
    dbConfig.db,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        operatorsAliases: false,
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        }
    }
);

const db = {};
db['sequelize'] = Sequelize;
db['sequelizeConfig'] = sequelizeConfig;
db['user'] = require('./user_model.ts')(sequelizeConfig, Sequelize);
db['schedule'] = require('./schedule_model.ts')(sequelizeConfig, Sequelize);

module.exports = db;