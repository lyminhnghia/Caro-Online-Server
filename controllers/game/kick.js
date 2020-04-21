const Kick = (io, socket, rooms, players, map) => {
    socket.on('kick', async () => {
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
        await io.to(player.username).emit('kick')
        havePassword = room.password !== ''
        await socket.broadcast.emit('create', {
            username        : player.username,
            imageUrl        : player.imageUrl,
            havePassword    : havePassword,
            elo             : player.elo,
            timelapse       : room.timelapse,
            rank            : room.rank
        })
        room.ready = false
        let join = players[map[room.joinname]]
    
        await io.sockets.connected[map[room.joinname]].broadcast.emit('player', {
            busy: false,
            username: join.username,
            imageUrl: join.imageUrl,
            elo: join.elo
        })
        join.currentRoom = null
        room.joinname = null
    })
}

module.exports = Kick