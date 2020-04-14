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
        const user = (await sequelize.query(`Select username, elo, imageUrl from users WHERE id = ${socket.decoded_token.id}`,{
            type: sequelize.QueryTypes.SELECT
        }))[0]

        socket.broadcast.emit('player', {
            busy: false,
            username: user.username,
            imageUrl: user.imageUrl,
            elo: user.elo
        })

        if (map[user.username]) {
            io.sockets.connected[socket.id].disconnect()
        } else {
            map[user.username] = socket.id
        }

        players[socket.id] = {
            username            : user.username,
            elo                 : user.elo,
            imageUrl            : user.imageUrl,
            currentRoom         : null
        }
        
        socket.on('information', () => {
            socket.emit('information', {
                username : user.username,
                elo: user.elo,
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
                if (player.username === user.username) {
                    continue
                }
                result.push({
                    username : player.username,
                    imageUrl : player.imageUrl,
                    elo : player.elo
                })
            }
            socket.broadcast.emit('players', result)
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
                username        : user.username,
                imageUrl        : user.imageUrl,
                havePassword    : havePassword,
                elo             : user.elo,
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
            
            io.emit('delete', {username: data.username})
            io.to(data.username).emit('join', {
                success: true,
                username : user.username,
                imageUrl : user.imageUrl,
                elo : user.elo
            })
            socket.join(data.username)
            socket.emit('join', {
                success: true,
                username : data.username,
                imageUrl : players[map[data.username]].imageUrl,
                elo : players[map[data.username]].elo
            })
            socket.broadcast.emit('player', {
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
                    let room = rooms[user.username]
                    io.to(player.username).emit('leave')
                    if (room.joinname) {
                        let join = players[map[room.joinname]]
                        players[map[room.joinname]].currentRoom = null
                        players[socket.id].currentRoom = null
                        io.sockets.connected[map[room.joinname]].broadcast.emit('player', {
                            busy: false,
                            username: join.username,
                            imageUrl: join.imageUrl,
                            elo: join.elo
                        })
                        delete rooms[user.username]
                    } else {
                        players[socket.id].currentRoom = null
                        delete rooms[user.username]
                    }
                }
            }
            socket.broadcast.emit('player', {
                busy: false,
                username: player.username,
                imageUrl: player.imageUrl,
                elo: player.elo
            })
        })

        socket.on('kick', () => {
            let player = players[socket.id]
            let room = rooms[player.username]
            if (!room) {
                return
            }
            if (player.username !== player.currentRoom) {
                return
            }
            if (room.joinname === null) {
                return
            }
            io.to(player.username).emit('kick')
            let join = players[map[room.joinname]]
            
            join.currentRoom = null
            room.joinname = null
            socket.broadcast.emit('player', {
                busy: false,
                username: join.username,
                imageUrl: join.imageUrl,
                elo: join.elo
            })
        })

        socket.on('challenge', data => {
            io.to(map[data.username]).emit('challenge', {
                username: user.username,
                imageUrl: user.imageUrl,
                elo: user.elo
            })
        })

        socket.on('accept', data => {{
            if (!map[data.username]) {
                socket.emit('accept', { success: false, message: 'Người chơi đã offline'})
                return
            }
            if (players[map[data.username]].currentRoom !== null) {
                socket.emit('accept', { success: false, message: 'Người chơi đang bận' })
                return
            }

            rooms[data.username] = {
                hostname        : data.username,
                joinname        : user.username,
                password        : '',
                timelapse       : 20,
                rank            : true,
                ready           : false,
                started         : false
            }
        
            socket.join(data.username)
            io.sockets.connected[map[data.username]].join(data.username)
            socket.to(data.username).emit('accept', { 
                success: true,
                username: user.username,
                imageUrl: user.imageUrl,
                elo: user.elo
            })

            io.sockets.connected[map[data.username]].broadcast.emit('player', {
                busy: true,
                username: data.username
            })
            socket.broadcast.emit('player', {
                busy: true,
                username: user.username
            })
        }})

        socket.on('ready', data => {
            let player = players[socket.id]
            if (player.currentRoom) {
                rooms[player.currentRoom].ready = data.ready
                io.to(player.currentRoom).emit('ready', {ready: data.ready})
            }
        })

        socket.on('start', () => {
            let player = players[socket.id]
            if (!player.currentRoom) {
                socket.emit('start', {success: false, message: 'Bạn chưa tham gia phòng!'})
                return
            }
            if (player.currentRoom !== user.username) {
                socket.emit('start', {success: false, message: 'Bạn không phải là chủ phòng!'})
                return
            }
            if (rooms[player.currentRoom].ready === true) {
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
            socket.broadcast.emit('player', {
                busy: true,
                username: player.username
            })
            delete map[user.username]
            delete players[socket.id]
        })
    })

}