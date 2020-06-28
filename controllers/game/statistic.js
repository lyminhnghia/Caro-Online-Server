const db            = require('../../configs/db.config')
const sequelize     = db.sequelize

const Statistic = (socket) => {
 
    socket.on('statistic', async () => {

        result = {}
        result.win = socket.user.win
        result.lose = socket.user.lose

        result.history = await sequelize.query(`Select * from histories WHERE winner = '${socket.user.username}' OR loser = '${socket.user.username}' ORDER BY id DESC LIMIT 5`,{
            type: sequelize.QueryTypes.SELECT
        })

        result.rank = (await sequelize.query(`SELECT (1 + (SELECT count(*) FROM users a WHERE a.elo > b.elo )) AS ranking FROM users b WHERE username = '${socket.user.username}'`,{
            type: sequelize.QueryTypes.SELECT
        })).ranking

        socket.emit('statistic', result)

    })
}

module.exports = Statistic