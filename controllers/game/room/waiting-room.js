const db = require('../../../configs/db.config')
const sequelize = db.sequelize

const waiting = async (io, socket) => {
    const user = await sequelize.query(`Select username, elo from users WHERE id = ${socket.decoded_token.id}`,{
        type: sequelize.QueryTypes.SELECT
    })
    const waiting_room = await sequelize.query(`Select roomname, havepassword, timeformove from rooms`,{
        type: sequelize.QueryTypes.SELECT
    })
    socket.emit('waiting room', waiting_room)
    console.log(user[0].username, user[0].elo, waiting_room)
}

module.exports = waiting