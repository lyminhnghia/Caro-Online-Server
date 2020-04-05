const db = require('../../configs/db.config')
const User = db.user
module.exports = (io, token) => {

    io.on('connection', socket => {
        const data = User.query('Select * from users')
        console.log(`${socket.id}` + data)
    })

}