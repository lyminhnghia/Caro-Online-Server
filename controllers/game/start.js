const CheckBoard = require('./checkboard')
const Start = (io, socket, rooms, players, user, map) => {
    socket.on('start', async () => {
        let player = players[socket.id]
        // Kiểm tra xem người chơi có trong phòng không
        if (!player.currentRoom) {
            await socket.emit('start', {success: false, message: 'Bạn chưa tham gia phòng!'})
            return
        }
        // Kiểm tra xem người chơi có phải chủ phòng không
        if (player.currentRoom !== user.username) {
            await socket.emit('start', {success: false, message: 'Bạn không phải là chủ phòng!'})
            return
        }
        // Kiểm tra xem có người chơi cùng hay không
        if (rooms[player.currentRoom].joinname === null) {
            await socket.emit('start', {success: false, message: 'Không thể bắt đầu do thiếu người chơi!'})
            return
        }
        //Kiểm tra người chơi còn lại đã sẵn sàng hay chưa
        if (rooms[player.currentRoom].ready === false) {
            await io.to(player.currentRoom).emit('start', {success: false, message: 'Người chơi chưa sẵn sàng!'})
            return
        }

        // GameController
        room = rooms[player.currentRoom]
        room.started = true
        await io.to(player.currentRoom).emit('start', {success: true})
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

        hostSocket.on('leave', onLeaveMessage(hostSocket))

        joinSocket.on('leave', onLeaveMessage(joinSocket))

        hostSocket.on('put', async data => {
            // Kiểm tra xem có phải lượt người chơi không
            if (!hostTurn) {
                return
            }
            // Kiểm tra xem vị trí bàn cờ có trống không
            if (board[data.y][data.x] !== 0) {
                return
            }

            board[data.y][data.x] = 1
    
            await io.to(room.hostname).emit('put', {
                username: room.hostname,
                x: data.x,
                y: data.y
            })
            await clearInterval(interval)
            // Kiểm tra kết quả trận đấu
            check = await CheckBoard(board, data.x, data.y)
            if (check) {
                await io.to(room.hostname).emit('end', {username: room.hostname})
                return
            }

            hostTurn = false
            remaining = room.timelapse
            await emitTurn()
            interval = await createInterval()
            
        })
    
        joinSocket.on('put', async data => {
            // Kiểm tra xem có phải lượt người chơi không
            if (hostTurn) {
                return
            }
            // Kiểm tra xem vị trí bàn cờ có trống không
            if (board[data.y][data.x] !== 0) {
                return
            }
            board[data.y][data.x] = 2
    
            await io.to(room.hostname).emit('put', {
                username: room.joinname,
                x: data.x,
                y: data.y
            })
            await clearInterval(interval)
            // Kiểm tra trạng thái bàn cờ
            check = await CheckBoard(board, data.x, data.y)
            if (check) {
                await io.to(room.hostname).emit('end', {username: room.joinname})
                return
            } 

            hostTurn = true
            remaining = room.timelapse
            await emitTurn()
            interval = await createInterval()
        })

        await emitTurn()
        interval = await createInterval()

        async function emitTurn() {
            await io.to(room.hostname).emit('turn', hostTurn ? {
                username: room.hostname,
                remaining: remaining
            } : {
                username: room.joinname,
                remaining: remaining
            })
        }

        async function createInterval() {
            return setInterval(async () => {
                remaining--
                await emitTurn()
                // Kiểm tra thời gian còn lại
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
                    // Nếu không tìm được nước đi mới
                    if (position[0] === -1) {
                        await io.to(room.hostname).emit('even')
                        await clearInterval(interval)
                        return
                    } 
                    
                    // Tìm được nước đi mới
                    board[position[1]][position[0]] = hostTurn ? 1 : 2
                    await io.to(room.hostname).emit('put', hostTurn ? {
                        username: room.hostname,
                        x: position[0],
                        y: position[1]
                    } : {
                        username: room.joinname,
                        x: position[0],
                        y: position[1]
                    })
                    
                    // Kiểm tra kết quả trận đấu
                    check = await CheckBoard(board, data.x, data.y)
                    if (check === true) {
                        await io.to(room.hostname).emit('end', { username: hostTurn ? room.hostname : room.joinname })
                        await clearInterval(interval)
                        return
                    } 

                    hostTurn = !hostTurn
                    remaining = room.timelapse
                    await emitTurn()
                }
            }, 1000)
        }

        async function onLeaveMessage(socket) {
            await io.to(room.hostname).emit('leave')
            if (players[socket.id].username === room.hostname) {
                await io.to(room.hostname).emit('end', { username : room.joinname })
            } else {
                await io.to(room.hostname).emit('end', { username : room.hostname })
            }
            await hostSocket.off('leave', onLeaveMessage)
            await joinSocket.off('leave', onLeaveMessage)
            await clearInterval(interval)
        }
    })
}


module.exports = Start