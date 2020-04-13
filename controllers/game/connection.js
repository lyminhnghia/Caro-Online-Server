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

        socket.on('players', () => {
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
            socket.emit('players', result)
        })

        socket.on('rooms', () => {
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
            socket.emit('rooms', result)
        })

        socket.on('create', data => {
            rooms[user.username] = {
                hostname        : user.username,
                joinname        : null,
                password        : data.password,
                timelapse       : data.timelapse,
                rank            : data.rank,
                ready           : false,
                started         : false
            }
        
            socket.join(user.username)

            havePassword = data.password !== ''

            io.emit('create', {
                hostname        : user.username,
                joinname        : null,
                havePassword    : havePassword,
                timelapse       : data.timelapse,
                rank            : data.rank
            })

            players[socket.id].currentRoom = user.username
        })

        socket.on('join', data => {
            if (!rooms[data.username]) {
                socket.emit('join', {success: false, message: 'Phòng không tồn tại!'})
                return
            }
            if (rooms[data.username].password !== data.password) {
                socket.emit('join', {success: false, message: 'Sai mật khẩu!'})
                return
            }
            if (rooms[data.username].joinname !== null) {
                socket.emit('join', {success: false, message: 'Phòng đã đầy!'})
                return
            }
            rooms[data.username].joinname = user.username
            players[socket.id].currentRoom = data.username
            socket.join(data.username)
            io.emit('delete', {username: data.username})
            io.to(data.username).emit('join', {
                success: true,
                username : user.username,
                isLocalImage : user.isLocalImage,
                imageUrl : user.imageUrl,
                elo : user.elo
            })
            io.emit('player', {
                busy: true,
                username: user.username
            })
        })

        socket.on('leave', () => {
            let player = players[socket.id]
            let room = rooms[player.currentRoom]
            if (!room.started) {
                if (player.username !== player.currentRoom) {
                    room.joinname = null
                    io.emit('create', {
                        hostname        : user.username,
                        joinname        : null,
                        havePassword    : havePassword,
                        timelapse       : room.timelapse,
                        rank            : room.rank
                    })
                    io.to(players[socket.id].currentRoom).emit('leave')
                    players[socket.id].currentRoom = null
                } else {
                    io.to(player.username).emit('leave')
                    players[map[rooms[user.username].joinname]].currentRoom = null
                    players[socket.id].currentRoom = null
                    delete rooms[user.username]
                }
            }
            io.emit('player', {
                busy: false,
                username: player.username,
                isLocalImage: player.isLocalImage,
                imageUrl: player.imageUrl,
                elo: player.elo
            })
        })

        socket.on('ready', data => {
            let player = players[socket.id]
            if (player.currentRoom) {
                rooms[player.currentRoom].ready = data.ready
                io.to(player.currentRoom).emit('ready', {success: true, message: data.ready})
            }
        })

        socket.on('start', () => {
            let player = players[socket.id]
            if (!player.currentRoom) {
                socket.emit('start', {success: false, message: 'Bạn chưa tham gia phòng!'})
                return
            }
            if (rooms[player.currentRoom].ready) {
                rooms[player.currentRoom].started = true
                io.to(player.currentRoom).emit('start', {success: true})
            } else {
                io.to(player.currentRoom).emit('start', {success: false, message: 'Người chơi chưa sẵn sàng!'})
            }
        })

        socket.on('room', data => {
            havePassword = data.password !== ''

            rooms[user.username].password = data.password
            rooms[user.username].timelapse = data.timelapse
            rooms[user.username].rank = data.rank

            io.emit('room', {
                username        : user.username,
                havePassword    : havePassword,
                timelapse       : data.timelapse,
                rank            : data.rank
            })
        })

        socket.on('disconnect', () => {

            console.log(`Disconnected: ${socket.id}`)
            if (map[user.username] !== socket.id) {
                return
            }
            let player = players[socket.id]
            if (player.currentRoom) {
                let room = rooms[player.currentRoom]
                if (!room.started) {
                    if (player.username !== player.currentRoom) {
                        room.joinname = null
                        io.emit('create', {
                            hostname        : user.username,
                            joinname        : null,
                            havePassword    : havePassword,
                            timelapse       : room.timelapse,
                            rank            : room.rank
                        })
                        io.to(players[socket.id].currentRoom).emit('leave')
                        players[socket.id].currentRoom = null
                    } else {
                        io.to(player.username).emit('leave')
                        players[map[rooms[user.username].joinname]].currentRoom = null
                        players[socket.id].currentRoom = null
                        delete rooms[user.username]
                    }
                }
            }
            io.emit('player', {
                busy: true,
                username: player.username
            })
            delete map[user.username]
            delete players[socket.id]
        })
    })

}