module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
        username:   Sequelize.STRING,
        password:   Sequelize.STRING,
        win     :   {
            type        : Sequelize.INTEGER,
            defaultValue: 0
        },
        dickens :   {
            type        : Sequelize.INTEGER,
            defaultValue: 0
        },
        lose    :   {
            type        : Sequelize.INTEGER,
            defaultValue: 0
        },
        elo     :   {
            type        : Sequelize.FLOAT,
            defaultValue: 0.0
        },
    })
    return User
}