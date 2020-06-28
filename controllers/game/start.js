const CheckBoard    = require('./checkboard')
const db            = require('../../configs/db.config')
const sequelize     = db.sequelize
const Start = (io, socket, map) => {

    socket.on('start', async () => {

        let room = socket.room
        let history = ''
        first = ''
        winner = ''
        winPoint = 0
        losePoint = 0

        // Kiểm tra xem người chơi có trong phòng không
        if (room === null) {
            socket.emit('start', {
                success : false, 
                message : 'Bạn chưa tham gia phòng!'
            })
            return
        }

        // Kiểm tra xem người chơi có phải chủ phòng không
        if (socket.user.username !== room.hostname) {
            socket.emit('start', {
                success : false, 
                message : 'Bạn không phải là chủ phòng!'
            })
            return
        }

        // Kiểm tra xem có người chơi cùng hay không
        if (room.joinname === null) {
            socket.emit('start', {
                success : false, 
                message : 'Không thể bắt đầu do thiếu người chơi!'
            })
            return
        }

        // Kiểm tra xem đã bắt đầu chơi chưa
        if (room.started === true) {
            socket.emit('start', {
                success : false, 
                message : 'Trò chơi đã bắt đầu!'
            })
            return
        }

        //Kiểm tra người chơi còn lại đã sẵn sàng hay chưa
        if (room.ready === false) {
            socket.emit('start', {
                success : false, 
                message : 'Người chơi chưa sẵn sàng!'
            })
            return
        }

        // thông báo trận đấu bắt đầu
        room.started = true
        io.to(room.hostname).emit('start', {
            success : true
        })

        // lưu trạng thái bàn cờ
        turn = room.hostname
        remaining = room.timelapse
        board = [];
        for(var i = 0; i < 19; i++){
            board[i] = []
            for(var j = 0; j < 19; j++){
                board[i][j] = 0
            }
        }

        // thiết lập socket cho host và join
        hostSocket = map[room.hostname]
        joinSocket = map[room.joinname]

        hostSocket.on('leave', onHostLeave)
        joinSocket.on('leave', onJoinLeave)

        hostSocket.on('disconnect', onHostDisconnect)
        joinSocket.on('disconnect', onJoinDisconnect)

        hostSocket.on('put', data => onPut(room.hostname, data))
        joinSocket.on('put', data => onPut(room.joinname, data))

        hostSocket.on('first', data => {
            hostFirst = data.first
            hostSocket.removeAllListeners('first')
        })

        joinSocket.on('first', data => {
            joinFirst = data.first
            joinSocket.removeAllListeners('first')
        })

        hostFirst = null
        joinFirst = null

        interval = null

        function emitTurn() {
            io.to(room.hostname).emit('turn', {
                username: turn,
                remaining: remaining
            })
        }

        function emitPut(position) {
            io.to(room.hostname).emit('put', {
                username: turn,
                x: position.x,
                y: position.y
            })
        }

        timeout = setTimeout(function() {
            if (hostFirst === null && joinFirst === null) {
                turn = Math.floor(Math.random() * 2) === 1 ? hostSocket.user.username : joinSocket.user.username
            } else if (hostFirst === null) {
                turn = joinFirst ? joinSocket.user.username : hostSocket.user.username
            } else if (joinFirst === null) {
                turn = hostFirst ? hostSocket.user.username : joinSocket.user.username
            } else if ((hostFirst ^ joinFirst) === 1) {
                turn = hostFirst ? hostSocket.user.username : joinSocket.user.username
            } else {
                turn = Math.floor(Math.random() * 2) === 1 ? hostSocket.user.username : joinSocket.user.username
            }
            io.to(room.hostname).emit('first', {
                username : turn
            })
            first = turn
            interval = createInterval()
        }, 3000)
        

        function createInterval() {
            emitTurn()
            return setInterval(() => {
                remaining--
                emitTurn()
                // Kiểm tra thời gian còn lại
                if (remaining > 0) {
                    return
                }

                clearInterval(interval)

                let position = {
                    x : -1,
                    y : -1
                }

                for (let y = 0; y < 19; y++) {
                    for (let x = 0; x < 19; x++) {
                        if (board[y][x] === 0) {
                            position.x = x
                            position.y = y
                            x += 19
                            y += 19
                        }
                    }
                }

                // Nếu không tìm được nước đi mới
                if (position.x === -1) {
                    io.to(room.hostname).emit('even')
                    return
                } 
                    
                // Tìm được nước đi mới
                board[position.y][position.x] = turn == room.hostname ? 1 : 2
                emitPut(position)
                    
                // Kiểm tra kết quả trận đấu
                check = CheckBoard(board, position.x, position.y)
                if (check === true) {
                    winner = turn
                    io.to(room.hostname).emit('win', { 
                        username : turn,
                        rematch : true
                    })
                    if (room.rank) {
                        if (turn === hostSocket.user.username) {
                            updateElo(hostSocket, joinSocket)
                        } else {
                            updateElo(joinSocket, hostSocket)
                        }
                    }
                    closeMatch()
                    return
                } 

                turn = turn == room.hostname ? room.joinname : room.hostname
                remaining = room.timelapse
                interval = createInterval();
                
            }, 1000)
        }


        function onPut(username, position) {
            // Kiểm tra xem có phải lượt người chơi không
            if (turn !== username) {
                return
            }

            // Kiểm tra xem vị trí bàn cờ có trống không
            if (board[position.y][position.x] !== 0) {
                return
            }
            /*==================================================*/
            if (history !== '') {
                history = history + ';'
            }
            /*==================================================*/
            board[position.y][position.x] = username == room.hostname ? 1 : 2
            
            /*==================================================*/
            history = history + position.x + ',' + position.y
            /*==================================================*/
            
            emitPut(position)

            clearInterval(interval)

            // Kiểm tra trạng thái bàn cờ
            check = CheckBoard(board, position.x, position.y)
            if (check === true) {
                winner = turn
                io.to(room.hostname).emit('win', {
                    username : turn,
                    rematch : true
                })
                if (room.rank) {
                    if (turn === hostSocket.user.username) {
                        updateElo(hostSocket, joinSocket)
                    } else {
                        updateElo(joinSocket, hostSocket)
                    }
                }
                closeMatch()
                
                return
            } 

            turn = turn == room.hostname ? room.joinname : room.hostname
            remaining = room.timelapse
            interval = createInterval()
        }

        function updateElo(win, lose) {
            QWin    = Math.pow(10, win.user.elo/400)
            QLose   = Math.pow(10, lose.user.elo/400)
            EWin    = QWin/(QWin+QLose)
            ELose   = QLose/(QWin+QLose)
            k       = [25, 25, 25, 25, 20, 15, 10, 10, 10, 10, 10, 10]

            winPoint = k[parseInt(win.user.elo/400, 10)] * (1 - EWin)
            losePoint = k[parseInt(lose.user.elo/400, 10)] * (0 - ELose)
            winPoint = Math.round((winPoint + Number.EPSILON) * 100) / 100
            losePoint = Math.round((losePoint + Number.EPSILON) * 100) / 100

            win.user.elo    = win.user.elo + winPoint
            lose.user.elo   = lose.user.elo + losePoint

            win.user.elo    = Math.round((win.user.elo + Number.EPSILON) * 100) / 100
            lose.user.elo   = Math.round((lose.user.elo + Number.EPSILON) * 100) / 100

            sequelize.query(`UPDATE users set elo = ${win.user.elo} WHERE username = '${win.user.username}'`)
            sequelize.query(`UPDATE users set elo = ${lose.user.elo} WHERE username = '${lose.user.username}'`)

            win.emit('information', {
                username : win.user.username,
                elo: win.user.elo,
                imageUrl : win.user.imageUrl
            })
            lose.emit('information', {
                username : lose.user.username,
                elo: lose.user.elo,
                imageUrl : lose.user.imageUrl
            })
        }

        function onHostLeave() {
            clearInterval(interval)
            clearTimeout(timeout)
            let message = hostSocket.user.username + ' đã thoát trận'
            winner = joinSocket.user.username
            joinSocket.emit('win', {
                username : joinSocket.user.username,
                message : message
            })
            if (room.rank) {
                updateElo(joinSocket, hostSocket)
            }
            closeMatch()
        }

        function onJoinLeave() {
            clearInterval(interval)
            clearTimeout(timeout)
            let message = joinSocket.user.username + ' đã thoát trận'
            winner = hostSocket.user.username
            hostSocket.emit('win', {
                username : hostSocket.user.username,
                message : message
            })
            if (room.rank) {
                updateElo(joinSocket, hostSocket)
            }
            closeMatch()
        }

        function onHostDisconnect() {
            clearInterval(interval)
            clearTimeout(timeout)
            let message = hostSocket.user.username + ' bị mất kết nối'
            winner = joinSocket.user.username
            joinSocket.emit('win', {
                username : joinSocket.user.username,
                message : message
            })
            if (room.rank) {
                updateElo(joinSocket, hostSocket)
            }
            closeMatch()
        }

        function onJoinDisconnect() {
            clearInterval(interval)
            clearTimeout(timeout)
            let message = joinSocket.user.username + ' bị mất kết nối'
            winner = hostSocket.user.username
            hostSocket.emit('win', {
                username : hostSocket.user.username,
                message : message
            })
            if (room.rank) {
                updateElo(joinSocket, hostSocket)
            }
            closeMatch()
        }


        function closeMatch() {
            hostSocket.removeListener('leave', onHostLeave)
            hostSocket.removeListener('disconnect', onHostDisconnect)
            joinSocket.removeListener('leave', onJoinLeave)
            joinSocket.removeListener('disconnect', onJoinDisconnect)
            hostSocket.removeAllListeners('put')
            joinSocket.removeAllListeners('put')
            hostSocket.removeAllListeners('first') 
            joinSocket.removeAllListeners('first')
            loser = winner === hostSocket.user.username ? joinSocket.user.username : hostSocket.user.username
            if (winner === hostSocket.user.username) {
                hostSocket.user.win++
                joinSocket.user.lose++
                sequelize.query(`UPDATE users set win = ${hostSocket.user.win} WHERE username = '${winner}'`)
                sequelize.query(`UPDATE users set lose = ${joinSocket.user.lose} WHERE username = '${loser}'`)
            } else {
                joinSocket.user.win++
                hostSocket.user.lose++
                sequelize.query(`UPDATE users set win = ${joinSocket.user.win} WHERE username = '${winner}'`)
                sequelize.query(`UPDATE users set lose = ${hostSocket.user.lose} WHERE username = '${loser}'`)
            }
            sequelize.query(`INSERT INTO histories(winner, loser, history, first, winPoint, losePoint, createdAt, updateAt) VALUES ('${winner}', '${loser}', '${history}', '${first}', ${winPoint}, ${losePoint}, '${Date.now()}', '${Date.now()}')`)
        }
    })
}


module.exports = Start