module.exports = (sequelize, Sequelize) => {
    const Room = sequelize.define('rooms', {
        roomname    :   Sequelize.STRING,
        havepassword:   Sequelize.BOOLEAN,
        password    :   Sequelize.STRING,
        timeformove :   Sequelize.INTEGER,
        limit       :   {
            type        : Sequelize.INTEGER,
            defaultValue: 2
        }
    })
    return Room
}