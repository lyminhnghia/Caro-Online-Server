const Information = (socket) => {

    emitInformation()

    socket.on('information', () => {
        console.log('run')
        emitInformation()
    })

    function emitInformation() {
        socket.emit('information', {
            username : socket.user.username,
            elo: socket.user.elo,
            imageUrl : socket.user.imageUrl
        })
    }
}

module.exports = Information