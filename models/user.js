module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
        username:   Sequelize.STRING,
        password:   Sequelize.STRING
    })
    return User
}