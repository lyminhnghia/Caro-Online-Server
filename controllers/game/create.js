const Create = (socket, rooms, players, user) => {
    socket.on('create', async data => {
        rooms[user.username] = {
            hostname        : user.username,
            joinname        : null,
            password        : data.password,
            timelapse       : data.timelapse,
            rank            : data.rank,
            ready           : false,
            started         : false
        }
    
        await socket.join(user.username)

        havePassword = data.password !== ''

        await socket.broadcast.emit('create', {
            username        : user.username,
            imageUrl        : user.imageUrl,
            havePassword    : havePassword,
            elo             : user.elo,
            timelapse       : data.timelapse,
            rank            : data.rank
        })

        players[socket.id].currentRoom = user.username
    })
}

module.exports = Create