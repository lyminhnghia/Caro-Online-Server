const db = require('../../configs/db.config')
const sequelize = db.sequelize
const socketJwt = require('socketio-jwt')

const Information   = require('./information')
const Players       = require('./players')
const Rooms         = require('./rooms')
const Create        = require('./create')
const Join          = require('./join')
const Leave         = require('./leave')
const Kick          = require('./kick')
const Challenge     = require('./challenge')
const Accept        = require('./accept')
const Ready         = require('./ready')
const Start         = require('./start')
const Room          = require('./room')
const Disconnect    = require('./disconnect')

module.exports = (io) => {
    const players = {}
    const map = []
    const rooms = {}
    io.on('connection', socketJwt.authorize({
        secret: 'uet-team-secret',
        timeout: 10000
    })).on('authenticated', async socket => {
        const user = (await sequelize.query(`Select username, elo, imageUrl from users WHERE id = ${socket.decoded_token.id}`,{
            type: sequelize.QueryTypes.SELECT
        }))[0]

        socket.broadcast.emit('player', {
            busy: false,
            username: user.username,
            imageUrl: user.imageUrl,
            elo: user.elo
        })

        if (map[user.username]) {
            io.sockets.connected[socket.id].disconnect()
        } else {
            map[user.username] = socket.id
        }

        players[socket.id] = {
            username            : user.username,
            elo                 : user.elo,
            imageUrl            : user.imageUrl,
            currentRoom         : null
        }

        Information(socket, user)

        Players (socket, players, user)

        Rooms(socket, players, rooms, map)

        Create(socket, rooms, players, user)

        Join(io, socket, rooms, players, user, map)

        Leave(io, socket, rooms, players, user, map)

        Kick(io, socket, rooms, players, map)

        Challenge(io, socket, user, map)

        Accept(io, socket, players, user, map)

        Ready(io, socket, rooms, players) 

        Start(io, socket, rooms, players, user)
        
        Room(io, socket, rooms, user)
        
        Disconnect(io, socket, rooms, players, user, map)
    })

}