module.exports = {
    host: 'localhost',
    username: 'root',
    password: 'whdrms6533@',
    db: 'schedulemanager',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};