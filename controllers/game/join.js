const Player = require('./player')

const Join = (socket, map) => {

    socket.on('join', data => {

        // nếu phòng không tồn tại
        if (map[data.username].room === null) {
            socket.emit('join', {
                success : false, 
                message : 'Phòng không tồn tại!'
            })
            return
        }

        let room = map[data.username].room

        // nếu như không đúng mật khẩu 
        if (room.password !== data.password) {
            socket.emit('join', {
                success : false, 
                message: 'Sai mật khẩu!'
            })
            return
        }

        // nếu như phòng đã đầy
        if (room.joinname !== null) {
            socket.emit('join', {
                success : false, 
                message : 'Phòng đã đầy!'
            })
            return
        }

        let user = socket.user
        room.joinname = user.username
        socket.room = room
        
        // thông báo cho mọi người phòng đã đầy
        socket.broadcast.emit('delete', {
            username : data.username
        })

        // tham gia phòng
        socket.join(data.username)

        // thông báo cho chủ phòng về sự tham gia của bản thân
        socket.to(data.username).emit('join', {
            success: true,
            username : user.username,
            imageUrl : user.imageUrl,
            elo : user.elo
        }) 
        
        // thông báo tham gia phòng thành công
        socket.emit('join', {
            success: true
        })

        // thông báo cho mọi người người chơi đã bận
        Player(socket, true)
        
    })
}

module.exports = Join