var express = require('express')
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

app.get("/", function (req, res) {
    res.send("Server Caro Online!")
})

var port = process.env.PORT || 3000
app.listen(port)