const Players = (io, socket) => {

    function getPlayers() {
        let result = []
        let sockets = io.sockets.connected
        for (i in sockets) {
            if (socket === sockets[i] || sockets[i].room !== null) {
                continue
            }
            let user = sockets[i].user
            result.push({
                username : user.username,
                imageUrl : user.imageUrl,
                elo : user.elo
            })
        }
        return result
    }

    socket.on('players', () => {
        result = getPlayers()
        socket.emit('players', result)
    })
}

module.exports = Players