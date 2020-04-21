const Leave = (io, socket, rooms, players, user, map) => {
    socket.on('leave', async () => {
        let player = players[socket.id]
        let room = rooms[player.currentRoom]
        if (room.started == false) {
            if (player.username !== player.currentRoom) {
                room.joinname = null
                room.ready = false
                let host = players[map[room.hostname]]
                await io.sockets.connected[map[host.username]].broadcast.emit('create', {
                    username        : host.username,
                    imageUrl        : host.imageUrl,
                    havePassword    : havePassword,
                    elo             : host.elo,
                    timelapse       : room.timelapse,
                    rank            : room.rank
                })
                await io.to(players[socket.id].currentRoom).emit('leave')
                players[socket.id].currentRoom = null
            } else {
                let room = rooms[user.username]
                await io.to(player.username).emit('leave')
                if (room.joinname) {
                    let join = players[map[room.joinname]]
                    join.currentRoom = null
                    players[socket.id].currentRoom = null
                    await io.sockets.connected[map[room.joinname]].broadcast.emit('player', {
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
        await socket.broadcast.emit('player', {
            busy: false,
            username: player.username,
            imageUrl: player.imageUrl,
            elo: player.elo
        })
    })
}

module.exports = Leave