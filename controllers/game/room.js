const Room = (io, socket, rooms, user) => {
    socket.on('room', async data => {
        havePassword = data.password !== ''

        rooms[user.username].password = data.password
        rooms[user.username].timelapse = data.timelapse
        rooms[user.username].rank = data.rank

        await io.emit('room', {
            username        : user.username,
            havePassword    : havePassword,
            timelapse       : data.timelapse,
            rank            : data.rank
        })
    })
}

module.exports = Room