const Rooms = (socket, players, rooms) => {
    const data = () => {
        let result = []
        for (i in rooms) {
            let room = rooms[i]
            if (room.joinname) {
                continue
            }
            let host = players[map[room.hostname]]
            let havePassword = room.password !== ''
            result.push({
                username: host.username,
                imageUrl: host.imageUrl,
                timelapse: room.timelapse,
                rank: room.rank,
                elo: host.elo,
                havePassword : havePassword
            })
        }
        return result
    }
    socket.on('rooms', async () => {
        let result =  await data()
        socket.emit('rooms', result)
    })
}

module.exports = Rooms