const Ready = (io, socket, rooms, players) => {
    socket.on('ready', async data => {
        let player = players[socket.id]
        if (player.currentRoom) {
            rooms[player.currentRoom].ready = data.ready
            await io.to(player.currentRoom).emit('ready', {ready: data.ready})
        }
    })
}

module.exports = Ready