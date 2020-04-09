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
        
        socket.on('information', data => {
            console.log(data)
            socket.emit('information', freePlayers[socket.id])
        })

        socket.on('list player', () => {
            socket.emit('list player', freePlayers)
        })

        socket.on('list room', () => {
            let rooms = []
            for (i in freeRooms) {
                let host = busyPlayers[map[freeRooms[i].hostname]]
                let havePassword = freeRooms[i].password !== ""
                rooms.push({
                    username: host.username,
                    isLocalImage: host.isLocalImage,
                    imageUrl: host.imageUrl,
                    timelapse: freeRooms[i].timelapse,
                    rank: freeRooms[i].rank,
                    elo: host.elo,
                    havePassword : havePassword
                })
            }
            socket.emit('list room', rooms)
        })

        socket.on('create room', data => {
            freeRooms[socket.id] = {
                hostname        : freePlayers[socket.id].username,
                joinname        : null,
                password        : data.password,
                timelapse       : data.timelapse,
                rank            : data.rank
            }
        
            socket.join(socket.id)

            havePassword = data.password === ''

            io.emit('create room', {
                username            : freePlayers[socket.id].username,
                elo                 : freePlayers[socket.id].elo,
                isLocalImage        : freePlayers[socket.id].isLocalImage,
                imageUrl            : freePlayers[socket.id].imageUrl,
                rank                : data.rank,
                timelapse           : data.timelapse,
                havePassword        : havePassword
            })

            busyPlayers[socket.id] = freePlayers[socket.id]
            delete freePlayers[socket.id]
        })

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