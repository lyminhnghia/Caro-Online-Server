const Room = (io, socket) => {
 
    socket.on('room', data => {

        // nếu không trong phòng
        if (socket.room === null) {
            return
        }

        let room = socket.room

        // nếu không phải chủ phòng
        if (room.hostname !== socket.user.username) {
            return
        }

        // cập nhật cài đặt phòng
        room.password = data.password
        room.timelapse = data.timelapse
        room.rank = data.rank
    
        // thông báo thay đổi cho mọi người
        io.to(room.hostname).emit('room', {
            username        : room.hostname,
            havePassword    : room.password !== '',
            timelapse       : room.timelapse,
            rank            : room.rank
        })
    })
}

module.exports = Room