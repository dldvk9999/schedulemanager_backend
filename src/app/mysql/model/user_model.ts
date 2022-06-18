module.exports = (sequelizeConfig, Sequelize) => {
    const User = sequelizeConfig.define(
        'user',
        {
            email: {
                type: Sequelize.STRING
            },
            password: {
                type: Sequelize.STRING
            },
            name: {
                type: Sequelize.STRING
            },
            deptname: {
                type: Sequelize.STRING
            },
            job: {
                type: Sequelize.STRING
            },
            tag: {
                type: Sequelize.STRING
            },
            usertype: {
                type: Sequelize.INTEGER
            },
            description: {
                type: Sequelize.STRING
            }
        }
    );
    return User;
};