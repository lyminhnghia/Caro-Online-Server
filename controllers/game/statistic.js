const db            = require('../../configs/db.config')
const sequelize     = db.sequelize

const Statistic = (socket) => {
 
    socket.on('statistic', async () => {

        result = {}
        result.win = socket.user.win
        result.lose = socket.user.lose

        result.history = await sequelize.query(`SELECT * FROM histories WHERE winner = '${socket.user.username}' OR loser = '${socket.user.username}' ORDER BY id DESC LIMIT 5`,{
            type: sequelize.QueryTypes.SELECT
        })

        result.rank = (await sequelize.query(`SELECT (1 + COUNT(*)) AS count FROM users WHERE elo > '${socket.user.elo}'`,{
            type: sequelize.QueryTypes.SELECT
        }))[0].count
        
        socket.emit('statistic', result)

    })
}

module.exports = Statistic