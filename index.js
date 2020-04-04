var express = require('express')
const path = require('path')
var app = express()
app.use(express.json())
const cors = require('cors')
app.use(cors())
require('dotenv').config()

require('./routes/route')(app)
const db = require('./configs/db.config')

db.sequelize.sync().then(() => {
    console.log("Sequelize is Running")
}).catch(err => {
    console.log(err.message)
})

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
})

var port = process.env.PORT
app.listen(port)