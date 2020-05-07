const CheckBoard = require('./checkboard')

const GameController = (io, room, players, map) => {
    hostTurn = true
    remaining = room.timelapse
    hostSocket = io.sockets.connected[map[room.hostname]]
    joinSocket = io.sockets.connected[map[room.joinname]]

    board = [];
    for(var i = 0; i < 19; i++){
        board[i] = []
        for(var j = 0; j < 19; j++){
            board[i][j] = 0
        }
    }

    io.to(room.hostname).emit('turn', {username: room.hostname, remaining: remaining})

    interval = createInterval()
    
    function createInterval() {
        clearInterval(interval)
        return setInterval(async () => {
            remaining--
            io.to(room.hostname).emit('turn', hostTurn ? {
                username: room.hostname,
                remaining: remaining
            } : {
                username: room.joinname,
                remaining: remaining
            })
            if (remaining === 0) {
                position = [-1, -1]
                for (let y = 0; y < 19; y++) {
                    for (let x = 0; x < 19; x++) {
                        if (board[y][x] === 0) {
                            position[0] = x
                            position[1] = y
                            x += 19
                            y += 19
                        }
                    }
                }
                if (position[0] === -1) {
                    io.to(room.hostname).emit('even')
                } else {
                    board[position[1]][position[0]] = hostTurn ? 1 : 2
                    io.to(room.hostname).emit('put', hostTurn ? {
                        username: room.hostname,
                        x: position[0],
                        y: position[1]
                    } : {
                        username: room.joinname,
                        x: position[0],
                        y: position[1]
                    })
                    hostTurn = !hostTurn
                    remaining = room.timelapse
                    io.to(room.hostname).emit('turn', hostTurn ? {
                        username: room.hostname,
                        remaining: remaining
                    } : {
                        username: room.joinname,
                        remaining: remaining
                    })
                }
            }
        }, 1000)
    }

    hostSocket.on('put', async data => {
        if (!hostTurn) {
            return
        }
        if (board[data.y][data.x] !== 0) {
            return
        }
        board[data.y][data.x] = 1

        io.to(room.hostname).emit('put', {
            username: room.hostname,
            x: data.x,
            y: data.y
        })
        clearInterval(interval)
        check = await CheckBoard(board, data.x, data.y)
        if (check) {
            io.to(room.hostname).emit('end', {username: room.hostname})
        } else {
            hostTurn = false
            remaining = room.timelapse
            interval = createInterval()
        }
    })

    joinSocket.on('put', async data => {
        if (hostTurn) {
            return
        }
        if (board[data.y][data.x] !== 0) {
            return
        }
        board[data.y][data.x] = 2

        io.to(room.hostname).emit('put', {
            username: room.joinname,
            x: data.x,
            y: data.y
        })
        clearInterval(interval)
        check = await CheckBoard(board, data.x, data.y)
        if (check) {
            io.to(room.hostname).emit('end', {username: room.joinname})
        } else {
            hostTurn = true
            remaining = room.timelapse
            interval = createInterval()
        }
    })
}

module.exports = GameController