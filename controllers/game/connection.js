const db = require('../../configs/db.config')
const User = db.user
module.exports = (io, token) => {

    io.on('connection', socket => {
        console.log('connection')
    })

}