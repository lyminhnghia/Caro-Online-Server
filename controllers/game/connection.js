const db = require('../../configs/db.config')
const sequelize = db.sequelize
const socketJwt = require('socketio-jwt')

// const waiting = require('./room/waiting-room')

module.exports = (io) => {
    const freePlayers = {}
    const map = []
    const busyPlayers = {}
    const freeRooms = {}
    const busyRooms = {}
    io.on('connection', socketJwt.authorize({
        secret: 'uet-team-secret',
        timeout: 10000
    })).on('authenticated', async socket => {
        const user = await sequelize.query(`Select username, elo, isLocalImage, imageUrl from users WHERE id = ${socket.decoded_token.id}`,{
            type: sequelize.QueryTypes.SELECT
        })

        if (map[user[0].username]) {
            console.log(map)
            io.sockets.connected[socket.id].disconnect()
        } else {
            map[user[0].username] = socket.id
        }

        socket.emit('server ready')

        freePlayers[socket.id] = {
            username            : user[0].username,
            elo                 : user[0].elo,
            isLocalImage        : user[0].isLocalImage,
            imageUrl            : user[0].imageUrl
        }
        
        socket.on('call information', data => {
            console.log(data)
            io.emit('information player', freePlayers[socket.id])
        })

        socket.on('list player', () => {
            io.emit('list player', freePlayers)
        })

        // socket.on('create room', data => {
        //     rooms[freePlayers[socket.id].username] = {
        //         hostId          : socket.id,
        //         joinId          : null,
        //         password        : data.password,
        //         timelapse       : data.timelapse,
        //         rank            : data.rank
        //     }
        //     socket.join(data.username)

        //     havePassword = data.password === ''

        //     io.emit('create room', {
        //         username            : players[socket.id].username,
        //         elo                 : players[socket.id].elo,
        //         isLocalImage        : players[socket.id].isLocalImage,
        //         imageUrl            : players[socket.id].imageUrl,
        //         rank                : data.rank,
        //         timelapse           : data.timelapse,
        //         havePassword        : havePassword
        //     })
        // })

        // socket.on('delete room', () =>{
        //     delete rooms[players[socket.id].username]
        //     io.emit('delete room', players[soc])
        // })

        // socket.on('listen room', listen => {
        //     players[socket.id].roomListen = listen
        //     if (listen) {
        //         io.emit('listen room', rooms)
        //     }
        // })

        socket.on('disconnect', () => {

            console.log(`Disconnected: ${socket.id}`)
            if (map[user[0].username] !== socket.id) {
                return
            }
            delete map[user[0].username]
            if (freePlayers[socket.id]) {
                delete freePlayers[socket.id]
            } else {
                delete busyPlayers[socket.id]
            }
        })
    })

}