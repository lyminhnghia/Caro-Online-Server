const Player = require('./player')

const Leave = (socket, map) => {

    socket.on('leave', () => {

        let room = socket.room

        // nếu như không trong phòng
        if (room === null) {
            return
        }

        let user = socket.user
        
        // thông báo đã rời đi
        socket.to(room.hostname).emit('leave')

        // xóa room khỏi socket
        socket.room = null

        // thông báo người chơi rảnh
        Player(socket, false)

        // nếu như là chủ phòng
        if (user.username === room.hostname) {
            
            // thoát room
            socket.leave(room.hostname)

            // xóa thông tin chủ phòng
            room.hostname = null

            // thông báo phòng đã bị xóa
            socket.broadcast.emit('delete', {
                username : user.username
            })
        
        // nếu không phải chủ phòng
        } else {

            // thoát room
            socket.leave(room.hostname)

            // xóa thông tin người tham gia
            room.joinname = null

            // nếu phòng chưa bắt đầu
            if (room.started === false && room.hostname !== null) {

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

    })
}

module.exports = Leave