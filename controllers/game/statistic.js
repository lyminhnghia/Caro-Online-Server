const db            = require('../../configs/db.config')
const sequelize     = db.sequelize

const Statistic = (io, socket) => {
 
    socket.on('statistic', () => {

        // 
        result = {}
        result.win = socket.user.win
        result.lose = socket.user.lose

        result.history = await sequelize.query(`Select * from histories WHERE winner = '${socket.user.username}' OR loser = '${socket.user.username}' ORDER BY id DESC LIMIT 5`,{
            type: sequelize.QueryTypes.SELECT
        })

        socket.emit('statistic', result)

    })
}

module.exports = Statistic