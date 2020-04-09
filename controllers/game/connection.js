const db = require('../../configs/db.config')
const sequelize = db.sequelize
const socketJwt = require('socketio-jwt')

// const waiting = require('./room/waiting-room')

module.exports = (io) => {
    const players = {}
    const map = []
    const rooms = {}
    io.on('connection', socketJwt.authorize({
        secret: 'uet-team-secret',
        timeout: 10000
    })).on('authenticated', async socket => {
        const user = (await sequelize.query(`Select username, elo, isLocalImage, imageUrl from users WHERE id = ${socket.decoded_token.id}`,{
            type: sequelize.QueryTypes.SELECT
        }))[0]

        if (map[user.username]) {
            io.sockets.connected[socket.id].disconnect()
        } else {
            map[user.username] = socket.id
        }

        socket.emit('server ready')

        players[socket.id] = {
            username            : user.username,
            elo                 : user.elo,
            isLocalImage        : user.isLocalImage,
            imageUrl            : user.imageUrl,
            currentRoom         : null
        }
        
        socket.on('information', () => {
            socket.emit('information', {
                username : user.username,
                elo: user.elo,
                isLocalImage : user.isLocalImage,
                imageUrl : user.imageUrl
            })
        })

        socket.on('list player', () => {
            let result = []
            for (i in players) {
                let player = players[i]
                if (player.currentRoom) {
                    continue
                }
                result.push({
                    username : player.username,
                    isLocalImage : player.isLocalImage,
                    imageUrl : player.imageUrl,
                    elo : player.elo
                })
            }
            socket.emit('list player', result)
        })

        socket.on('list room', () => {
            let result = []
            for (i in rooms) {
                let room = rooms[i]
                if (room.joinname) {
                    continue
                }
                let host = players[map[room.hostname]]
                let havePassword = room.password !== ''
                result.push({
                    username: host.username,
                    isLocalImage: host.isLocalImage,
                    imageUrl: host.imageUrl,
                    timelapse: room.timelapse,
                    rank: room.rank,
                    elo: host.elo,
                    havePassword : havePassword
                })
            }
            socket.emit('list room', result)
        })

        socket.on('create room', data => {
            rooms[user.username] = {
                hostname        : user.username,
                joinname        : null,
                password        : data.password,
                timelapse       : data.timelapse,
                rank            : data.rank
            }
        
            socket.join(user.username)

            havePassword = data.password !== ''

            io.emit('create room', {
                username            : user.username,
                elo                 : user.elo,
                isLocalImage        : user.isLocalImage,
                imageUrl            : user.imageUrl,
                rank                : data.rank,
                timelapse           : data.timelapse,
                havePassword        : havePassword
            })

            players[socket.id].currentRoom = user.username
        })

        socket.on('join room', data => {
            if (rooms[data.username].password === data.password) {
                rooms[data.username].joinname = user.username
                players[socket.id].currentRoom = data.username
                socket.join(data.username)
                socket.to(data.username).emit('join room', {
                    username : user.username,
                    isLocalImage : user.isLocalImage,
                    imageUrl : user.imageUrl,
                    elo : user.elo
                })
            }
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
            if (map[user.username] !== socket.id) {
                return
            }
            let player = players[socket.id]
            if (player.currentRoom) {
                socket.to(player.currentRoom).emit("quit")
                if (player.currentRoom == player.username) {
                    players[map[rooms[player.currentRoom].joinname]].currentRoom = null  
                    delete rooms[player.currentRoom]
                }
            }
            delete map[user.username]
            delete players[socket.id]
        })
    })

}