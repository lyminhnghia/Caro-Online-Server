const Rematch = (io, socket) => {

    socket.on('rematch', () => {

        let room = socket.room
        
        // nếu không có trong phòng
        if (room === null) {
            return
        }

        // nếu trong phòng không đủ người
        if (room.hostname === null || room.joinname === null) {
            return
        }

        // nếu là chủ phòng
        if (room.hostname === socket.user.username) {
            room.hostRematch = true
        
        // nếu không phải chủ phòng
        } else {
            room.joinRematch = true
        }

        // nếu cả 2 đồng ý đấu lại
        if (room.hostRematch !== undefined && room.joinRematch !== undefined) {
            delete room.hostRematch
            delete room.joinRematch
            room.started = false
            io.to(room.hostname).emit('rematch');
        }

    })

}

module.exports = Rematch