module.exports = (sequelize, Sequelize) => {
    const History = sequelize.define('histories', {
        winner :      Sequelize.STRING,
        loser :      Sequelize.STRING,
        history :   Sequelize.STRING,
        first :      Sequelize.STRING,
        winPoint :  Sequelize.FLOAT,
        losePoint : Sequelize.FLOAT
    })
    return History
}