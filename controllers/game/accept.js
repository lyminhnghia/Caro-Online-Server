const Accept = (io, socket, players, user, map) => {
    socket.on('accept', async data => {{
        if (!map[data.username]) {
            await socket.emit('accept', { success: false, message: 'Người chơi đã offline'})
            return
        }
        if (players[map[data.username]].currentRoom !== null) {
            await socket.emit('accept', { success: false, message: 'Người chơi đang bận' })
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
    
        await socket.join(data.username)
        await io.sockets.connected[map[data.username]].join(data.username)
        await socket.to(data.username).emit('accept', { 
            success: true,
            username: user.username,
            imageUrl: user.imageUrl,
            elo: user.elo
        })

        let host = players[map[data.username]]

        await socket.emit('accept', { 
            success: true,
            username: host.username,
            imageUrl: host.imageUrl,
            elo: host.elo
        })

        await io.sockets.connected[map[data.username]].broadcast.emit('player', {
            busy: true,
            username: data.username
        })
        await socket.broadcast.emit('player', {
            busy: true,
            username: user.username
        })
    }})
}

module.exports = Accept