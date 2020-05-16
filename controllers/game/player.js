const Player = (socket, busy) => {

    socket.broadcast.emit('player', busy === false ? {
        username : socket.user.username,
        busy : false,
        imageUrl : socket.user.imageUrl,
        elo : socket.user.elo
    } : {
        username : socket.user.username,
        busy : true
    })
    
}

module.exports = Player