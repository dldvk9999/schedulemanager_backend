module.exports = (sequelizeConfig, Sequelize) => {
    const Schedule = sequelizeConfig.define(
        'schedule',
        {
            user: {
                type: Sequelize.STRING
            },
            startdate: {
                type: Sequelize.DATE
            },
            enddate: {
                type: Sequelize.DATE
            },
            title: {
                type: Sequelize.STRING
            },
            memo: {
                type: Sequelize.STRING
            },
            alert: {
                type: Sequelize.INTEGER
            },
            again: {
                type: Sequelize.INTEGER
            },
            locate: {
                type: Sequelize.STRING
            },
            color: {
                type:Sequelize.INTEGER
            },
            file: {
                type: Sequelize.BLOB
            }
        }
    );
    return Schedule;
};