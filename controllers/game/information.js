const Information = (socket, user) => {
    socket.on('information',  () => {
        socket.emit('information', {
            username : user.username,
            elo: user.elo,
            imageUrl : user.imageUrl
        })
    })
}

module.exports = Information