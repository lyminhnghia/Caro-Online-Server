const db = require('../../configs/db.config')
const sequelize = db.sequelize
const socketJwt = require('socketio-jwt')

// const waiting = require('./room/waiting-room')

module.exports = (io) => {
    const players = {}
    const rooms = {}
    io.on('connection', socketJwt.authorize({
        secret: 'uet-team-secret',
        timeout: 10000
    })).on('authenticated', async socket => {
        const user = await sequelize.query(`Select username, elo from users WHERE id = ${socket.decoded_token.id}`,{
            type: sequelize.QueryTypes.SELECT
        })

        players[socket.id] = {
            id      : socket.id,
            username: user[0].username,
            elo     : user[0].elo
        }

        io.emit('information player', players[socket.id])

        socket.on('disconnect', () => {

            console.log(`Disconnected: ${socket.id}`)

            delete players[socket.id]

            io.emit('disconnect', socket.id)
        })

        console.log(players)
    })

}