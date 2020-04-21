const Disconnect = (io, socket, rooms, players, user, map) => {
    socket.on('disconnect', async () => {

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
                    let host = players[map[room.hostname]]
                    await io.emit('create', {
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
                    await io.to(player.username).emit('leave')
                    if (players[map[rooms[user.username].joinname]].currentRoom) {
                        players[map[rooms[user.username].joinname]].currentRoom = null
                    }
                    players[socket.id].currentRoom = null
                    delete rooms[user.username]
                }
            }
        }
        await socket.broadcast.emit('player', {
            busy: true,
            username: player.username
        })
        delete map[user.username]
        delete players[socket.id]
    })
}

module.exports = Disconnect