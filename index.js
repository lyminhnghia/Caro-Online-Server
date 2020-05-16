var express = require('express')
var app = express()

const server = require('http').Server(app)
const io = require('socket.io').listen(server)

app.use(express.json())
const cors = require('cors')
app.use(cors())
require('dotenv').config()

require('./routes/route')(app, io)
const db = require('./configs/db.config')

db.sequelize.sync().then(() => {
    console.log("Sequelize is Running")
}).catch(err => {
    console.log(err.message)
})

app.get("/", function (req, res) {
    res.send("Server Caro Online!")
})

var port = process.env.PORT
server.listen(port)