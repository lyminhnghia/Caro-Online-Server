const jwt = require('jsonwebtoken')
const db = require('../configs/db.config')

verifyToken = (req, res, next) => {
	let token = req.headers['x-access-token']
  
	if (!token){
		return res.status(403).send({ 
			success: false, message: 'No token provided.' 
		})
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err){
			return res.status(500).send({ 
					success: false, 
					message: 'Fail to Authentication. Error -> ' + err 
				})
		}
		req.userId = decoded.id
		next()
	})
}

checkUsername = (req, res, next) => {
	Username = req.body.username
	if (Username.length < 6) {
		return res.status(403).send({success: false, message: 'Username length >= 6'})
	} else if (Username.length > 20) {
		return res.status(403).send({success: false, message: 'Username length <= 20'})
	}
	next()
}

checkPassword = (req, res, next) => {
	Password = req.body.password
	if (Password.length < 6) {
		return res.status(403).send({success: false, message: 'Password length >= 6'})
	} else if (Password.length > 20) {
		return res.status(403).send({success: false, message: 'Password length <= 20'})
	}
	next()
}

const authJwt = {}
authJwt.verifyToken = verifyToken
authJwt.checkUsername = checkUsername
authJwt.checkPassword = checkPassword

module.exports = authJwt