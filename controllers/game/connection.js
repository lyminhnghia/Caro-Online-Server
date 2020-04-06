const socketJwt = require('socketio-jwt')

const waiting = require('./room/waiting-room')

module.exports = (io) => {

    io.on('connection', socketJwt.authorize({
        secret: 'uet-team-secret',
        timeout: 10000
    })).on('authenticated', async socket => {
        await waiting(io, socket)
    })

}