const Players = (socket, players, user) => {
    const data = () => {
        let result = []
        for (i in players) {
            let player = players[i]
            if (player.currentRoom) {
                continue
            }
            if (player.username === user.username) {
                continue
            }
            result.push({
                username : player.username,
                imageUrl : player.imageUrl,
                elo : player.elo
            })
        }
        return result
    }
    socket.on('players', async () => {
        let result = await data()
        socket.emit('players', result)
    })
}

module.exports = Players