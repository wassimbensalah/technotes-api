require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const path = require('path')
const IndexRouter = require('./routes/root') 
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require("cookie-parser")
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const { logger, logEvents } = require('./middleware/logger')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500 

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger) 

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())                     // nsit besh tzido elobsidian fi middlewares

app.use(express.static('public'))

app.use('/', IndexRouter)
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server is running on ${PORT}`))
} )    

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t$(err.hostname)`, 'mongoErrLog.Log')
})