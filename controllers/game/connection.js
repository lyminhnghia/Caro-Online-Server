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
const Invite        = require('./invite')
const Accept        = require('./accept')
const Ready         = require('./ready')
const Start         = require('./start')
const Room          = require('./room')
const Disconnect    = require('./disconnect')
const Player        = require('./player')
const Image         = require('./Image')
const LeaderBoard   = require('./leaderboard')
const Rematch       = require('./rematch')
const Statistic     = require('./statistic')

module.exports = (io) => {

    const map = []

    io.on('connection', socketJwt.authorize({
        secret: 'uet-team-secret',
        timeout: 10000
    })).on('authenticated', async socket => {

        socket.user = (await sequelize.query(`Select username, elo, win, lose, imageUrl from users WHERE id = ${socket.decoded_token.id}`,{
            type: sequelize.QueryTypes.SELECT
        }))[0]

        // Nếu đã đăng nhập thì ngắt kết nối
        if (map[socket.user.username]) {
            socket.disconnect()
            return
        }

        // liên kết username với socket
        map[socket.user.username] = socket

        // gắn thông tin user, room, challenge cho socket
        socket.room = null
        socket.challenge = []

        // gửi thông báo cho mọi người là đang online
        Player(socket, false)

        // gửi hình ảnh cho người dùng
        Image(socket)

        // gửi thông tin các user đang rảnh khi có yêu cầu
        Players(io, socket)

        // gửi thông tin các phòng khi có yêu cầu
        Rooms(io, socket)

        // xử lý khi nhận yêu cầu tạo phòng
        Create(socket)

        // xếp hạng người chơi theo elo
        LeaderBoard(socket)

        // xử lý khi nhận yêu cầu tham gia phòng
        Join(socket, map)

        // xử lý khi chủ phòng đuổi người chơi cùng phòng
        Kick(io, socket, map)

        // xử lý khi người chơi muốn đấu lại
        Rematch(io, socket)

        // xử lý khi người chơi thoát khỏi phòng
        Leave(socket, map)

        // gửi lời mời cho người khác
        Invite(socket, map)

        // chấp nhận lời mời
        Accept(io, socket, map)

        // xử lý khi người chơi sẵn sàng
        Ready(io, socket) 

        // bắt đầu trận đấu
        Start(io, socket, map)

        // thống kê
        Statistic(socket);
        
        // xử lý khi cập nhật lại thông tin phòng
        Room(io, socket)
        
        // xử lý khi mất kết nối
        Disconnect(socket, map)

        // gửi thông tin user lúc bắt đầu và khi có yêu cầu
        Information(socket)
    })

}