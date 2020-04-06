module.exports = (app, io) => {
    const authJwt       =       require('./verifyJwtToken')
    const user          =       require('../controllers/user/user')
    const connection    =       require('../controllers/game/connection')(io)

    app.post('/api/login', [authJwt.checkUsername, authJwt.checkPassword], user.login)
    app.post('/api/register', [authJwt.checkUsername, authJwt.checkPassword], user.register)
}