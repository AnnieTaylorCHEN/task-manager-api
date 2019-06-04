const path = require('path')

const express = require('express')
const hbs=require('hbs')
const methodOverride = require('method-override')

const mongoose = require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const indexRouter = require('./routers/index')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express()
const port = process.env.PORT

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '../templates/views'))
hbs.registerPartials(path.join(__dirname, '../templates/partials'))
app.use(express.static(path.join(__dirname, '../public')))
app.use(methodOverride('_method'))
// app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/', indexRouter)
app.use('/users', userRouter)
app.use('/tasks', taskRouter)


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/users/login', (req, res) => {
    res.render('login')
})


module.exports = app

