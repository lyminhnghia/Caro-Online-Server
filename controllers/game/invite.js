const Invite = (socket, map) => {

    socket.on('invite', data => {

        // nếu người đó đang online
        if (map[data.username]) {
            
            // ghi nhớ thời gian thách đấu
            socket.challenge[data.username] = Date.now()

            // gửi lời mời
            map[data.username].emit('invite', {
                username : socket.user.username,
                imageUrl : socket.user.imageUrl,
                elo : socket.user.elo
            })
        
        }

    })
}

module.exports = Invite