module.exports = (app) => {
    const authJwt   =       require('./verifyJwtToken')
    const user      =       require('../controllers/user/user')

    app.post('/api/login', user.login)
    app.post('/api/register', user.register)
}