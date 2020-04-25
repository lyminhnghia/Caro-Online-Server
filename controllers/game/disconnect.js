const Disconnect = (io, socket, rooms, players, user, map) => {
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
                    let host = players[map[room.hostname]]
                    io.emit('create', {
                        username        : host.username,
                        imageUrl        : host.imageUrl,
                        havePassword    : havePassword,
                        elo             : host.elo,
                        timelapse       : room.timelapse,
                        rank            : room.rank
                    })
                    io.to(players[socket.id].currentRoom).emit('leave')
                } else {
                    io.to(player.username).emit('leave')
                    if (rooms[user.username].joinname !== null) {
                        players[map[rooms[user.username].joinname]].currentRoom = null
                    }
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
}

module.exports = Disconnect