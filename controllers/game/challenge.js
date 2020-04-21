const Challenge = (io, socket, user, map) => {
    socket.on('challenge', data => {
        io.to(map[data.username]).emit('challenge', {
            username: user.username,
            imageUrl: user.imageUrl,
            elo: user.elo
        })
    })
}

module.exports = Challenge