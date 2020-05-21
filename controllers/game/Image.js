const db        = require('../../configs/db.config')
const User      = db.user

const Image = (socket) => {
    socket.on('image', data => {
        socket.user.imageUrl = data.imageUrl
        User.update({
            imageUrl: data.imageUrl,
            where: {
                username: socket.user.username
            }
        }).catch(err => console.log(err))
    })
}

module.exports  = Image