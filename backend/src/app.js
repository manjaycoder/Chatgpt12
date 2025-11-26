const express = require('express')
const cookieparser = require('cookie-parser')
const cors = require('cors')
const path = require('path')

// routes
const authRoutes = require('./routes/auth.routes')
const chatRoutes = require('./routes/chat.routes')

const app = express()

// CORS configuration for both development and production


app.use(cors({
    origin: "localhost:5173",
    credentials: true,
}))

app.use(express.json())
app.use(cookieparser())
app.use(express.static(path.join(__dirname, '../public')));

// routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)



app.use(express.static(path.join(__dirname,"../public")))
app.get("*name",(req,res)=>{
    res.sendFile(path.join(__dirname,"../public/index.html"))
})

module.exports = app
