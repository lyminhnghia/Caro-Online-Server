module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
        username:   Sequelize.STRING,
        password:   Sequelize.STRING,
        win     :   {
            type        : Sequelize.INTEGER,
            defaultValue: 0
        },
        even :   {
            type        : Sequelize.INTEGER,
            defaultValue: 0
        },
        lose    :   {
            type        : Sequelize.INTEGER,
            defaultValue: 0
        },
        elo     :   {
            type        : Sequelize.FLOAT,
            defaultValue: 500.0
        },
        imageUrl:   {
            type        : Sequelize.STRING,
            defaultValue: 'user0'
        }
    })
    return User
}