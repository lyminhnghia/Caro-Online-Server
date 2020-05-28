const LeaderBoard = (socket) => {
    socket.on('leaderboard', async () => {
        topRanking = (await sequelize.query(`Select username, elo, imageUrl from users ORDER BY elo DESC LIMIT 10`,{
            type: sequelize.QueryTypes.SELECT
        }))

        socket.emit('leaderboard', topRanking)
    })
}

module.exports = LeaderBoard