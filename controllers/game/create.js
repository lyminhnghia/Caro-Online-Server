const PLayer = require('./player')

const Create = (socket) => {
    socket.on('create', data => {

        let user = socket.user

        socket.room = {
            hostname        : user.username,
            joinname        : null,
            password        : data.password,
            timelapse       : data.timelapse,
            rank            : data.rank,
            ready           : false,
            started         : false
        }
    
        socket.join(user.username)

        // thông báo có phòng được tạo
        socket.broadcast.emit('create', {
            username        : user.username,
            imageUrl        : user.imageUrl,
            elo             : user.elo,
            havePassword    : data.password !== '',
            timelapse       : data.timelapse,
            rank            : data.rank
        })

        // thông báo người chơi bận
        PLayer(socket, true)
    })
}

module.exports = Create