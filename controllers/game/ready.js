const Ready = (io, socket) => {

    socket.on('ready', data => {

        let room = socket.room

        // nếu không có trong phòng
        if (room === null) {
            return
        }

        // nếu là chủ phòng
        if (room.hostname === socket.user.username) {
            return
        }

        room.ready = data.ready
        io.to(room.hostname).emit('ready', {
            ready : data.ready
        })

    })

}

module.exports = Ready