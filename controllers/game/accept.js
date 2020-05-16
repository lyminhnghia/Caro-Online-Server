const Player = require('./player')

const Accept = (io, socket, map) => {

    socket.on('accept', data => {{

        // nếu người đó không online
        if (!map[data.username]) {
            socket.emit('accept', { 
                message : 'Người chơi đã offline'
            })
            return
        }

        // nếu người chơi đang bận
        if (map[data.username].room !== null) {
            socket.emit('accept', { 
                message : 'Người chơi đang bận' 
            })
            return
        }

        // nếu không có lời mời
        if (!map[data.username].challenge[socket.user.username]) {
            socket.emit('accept', { 
                message : 'Không có lời mời tương ứng' 
            })
            return
        }
        
        // nếu lời mời quá 15 giấy
        if (map[data.username].challenge[socket.user.username] + 15000 < Date.now()) {
            socket.emit('accept', { 
                message : 'Lời mời hết hiệu lực' 
            })
            return
        }

        // tạo phòng
        let room = {
            hostname        : data.username,
            joinname        : socket.user.username,
            password        : '',
            timelapse       : 20,
            rank            : false,
            ready           : false,
            started         : false
        }

        // tham gia phòng
        socket.join(data.username)
        socket.room = room
        map[data.username].join(data.username)
        map[data.username].room = room

        // thông báo 2 người chơi bận
        Player(socket, true)
        Player(map[data.username], true)

        let host = map[data.username].user;
        let join = socket.user;

        // thông báo gửi lại cho 2 người chơi thông tin
        io.to(room.hostname).emit('challenge', {
            host : host,
            join : join,
            room : {
                rank : room.rank,
                timelapse : room.timelapse
            }
        })
    }})
}

module.exports = Accept