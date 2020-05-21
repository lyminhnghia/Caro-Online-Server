const db        = require('../../configs/db.config')
const sequelize = db.sequelize

const Image = (socket) => {
    socket.on('image', data => {
        socket.user.imageUrl = data.imageUrl
        sequelize.query(`UPDATE users set imageUrl = ${data.imageUrl} WHERE username = ${socket.user.username}`)
    })
}

module.exports  = Image