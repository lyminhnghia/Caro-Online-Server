const Player = require('./player')

const Disconnect = (socket, map) => {

    socket.on('disconnect', () => {

        console.log(`Disconnected: ${socket.user.username}`)

        let room = socket.room

        let user = socket.user

        // nếu như không trong phòng
        if (room === null) {
            Player(socket, true)
            delete map[user.username]
            return
        }

        // thông báo đã rời đi
        socket.to(room.hostname).emit('leave')

        // nếu như là chủ phòng
        if (user.username === room.hostname) {

            // xóa thông tin chủ phòng
            room.hostname = null
        
        // nếu không phải chủ phòng
        } else {

            // xóa thông tin người tham gia
            room.joinname = null

            // nếu phòng chưa bắt đầu
            if (room.started === false) {

                // lấy thông tin chủ phòng
                let host = map[room.hostname].user

                // thông báo phòng trống
                map[room.hostname].broadcast.emit('create', {
                    username        : host.username,
                    imageUrl        : host.imageUrl,
                    elo             : host.elo,
                    havePassword    : room.password !== '',
                    timelapse       : room.timelapse,
                    rank            : room.rank
                })
            }
        }
        
        // xóa liên kết user ~ socket
        delete map[user.username]

    })
}

module.exports = Disconnect