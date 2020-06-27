const Rooms = (io, socket) => {

    function getRooms() {
        let result = []
        let sockets = io.sockets.connected
        for (i in sockets) {
            if (i === socket) {
                continue
            }
            let room = sockets[i].room
            if (room == null || room.started == true || room.joinname != null) {
                continue
            }
            let user = sockets[i].user;
            result.push({
                username : user.username,
                imageUrl : user.imageUrl,
                elo : user.elo,
                timelapse : room.timelapse,
                rank : room.rank,
                havePassword : room.password !== ''
            })
        }
        return result
    }

    socket.on('rooms', () => {
        socket.emit('rooms', getRooms())
    })
}

module.exports = Rooms