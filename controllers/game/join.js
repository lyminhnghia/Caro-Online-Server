const Join = (io, socket, rooms, players, user, map) => {
    socket.on('join', async data => {
        if (!rooms[data.username]) {
            await socket.emit('join', {success: false, message: 'Phòng không tồn tại!'})
            return
        }
        if (rooms[data.username].password !== data.password) {
            await socket.emit('join', {success: false, message: 'Sai mật khẩu!'})
            return
        }
        if (rooms[data.username].joinname !== null) {
            await socket.emit('join', {success: false, message: 'Phòng đã đầy!'})
            return
        }
        rooms[data.username].joinname = user.username
        players[socket.id].currentRoom = data.username
        
        await io.emit('delete', {username: data.username})
        await io.to(data.username).emit('join', {
            success: true,
            username : user.username,
            imageUrl : user.imageUrl,
            elo : user.elo
        })
        await socket.join(data.username)
        await socket.emit('join', {
            success: true
        })
        await socket.broadcast.emit('player', {
            busy: true,
            username: user.username
        })
    })
}

module.exports = Join