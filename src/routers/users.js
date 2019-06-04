const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')
const router = new express.Router()

//Create an user account
router.post('/', async(req, res) => {
    // console.log(req.body)
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    try {
        await user.save()
        // console.log(user)
        // sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).render('welcome', {name: user.name})
    } catch (error) {
        res.status(400).send(error)
    }
})

//user login 
router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        // console.log(user)
        const token = await user.generateAuthToken()
        // console.log(token)
        // res.render('me', {name: user.name})
        res.redirect('/users/me')
    } catch (error) {
        res.status(400).send()
    }
})

//user log out
router.post('/logout', auth, async (req, res) => {
    try {
        req.user.token = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.redirect('users/login')
    } catch (error) {
        res.status(500).send()
    }
})

//user log out from all devices

router.post('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.redirect('users/login')
    } catch (error) {
        res.status(500).send()
    }
})

//user page

router.get('/me', auth, async (req, res) => {
    try {
        res.render('me', {name: user.name})
    } catch (error) {
        res.status(500).send()
    }
})


router.patch('/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/me', auth, async (req, res)=> {
    try {
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

//update avatar

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error ('Please upload only jpg, jpeg or png files.'))
        }
        cb (undefined, true)
    }
})


router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (error){
        res.status(500).send(error)
    }

})

router.get('/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar ){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send (user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router