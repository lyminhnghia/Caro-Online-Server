const Start = (io, socket, rooms, players, user) => {
    socket.on('start', async () => {
        let player = players[socket.id]
        if (!player.currentRoom) {
            await socket.emit('start', {success: false, message: 'Bạn chưa tham gia phòng!'})
            return
        }
        if (player.currentRoom !== user.username) {
            await socket.emit('start', {success: false, message: 'Bạn không phải là chủ phòng!'})
            return
        }
        if (rooms[player.currentRoom].ready === true) {
            rooms[player.currentRoom].started = true
            await io.to(player.currentRoom).emit('start', {success: true})
        } else {
            await io.to(player.currentRoom).emit('start', {success: false, message: 'Người chơi chưa sẵn sàng!'})
        }
    })
}

module.exports = Start