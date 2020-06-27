const Player = require('./player')

const Kick = (io, socket, map) => {

    socket.on('kick', () => {

        // nếu như không trong phòng
        if (socket.room === null) { 
            return
        }

        let user = socket.user
        let room = socket.room

        // nếu như không phải chủ phòng
        if (user.username !== room.hostname) {
            return
        }

        // nếu như không có người chơi còn lại
        if (room.joinname === null) {
            return
        }

        if (room.started == true) {
            return
        }

        // thông báo cho người còn lại bị đuổi
        io.to(room.hostname).emit('kick')

        // thông báo cho mọi người phòng trống
        socket.broadcast.emit('create', {
            username        : user.username,
            imageUrl        : user.imageUrl,
            elo             : user.elo,
            havePassword    : room.password !== '',
            timelapse       : room.timelapse,
            rank            : room.rank
        })

        // thông báo người bị đuổi đang rảnh
        Player(map[room.joinname], true)

        // xóa room khỏi socket người tham gia
        map[room.joinname].room = null

        // đặt lại thiết lập phòng
        room.ready = false
        room.joinname = null

    })
}

module.exports = Kick