const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)


test('Should singup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Annie',
        email: 'annie@annie.com',
        password:'MyPass777!'
    }).expect(201)

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //assertions about the response
    expect(response.body).toMatchObject({
        user:{
            name: 'Annie',
            email: 'annie@annie.com'
        }, 
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login non-exisiting user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'memememememe'
    }).expect(400)
}) 

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

 test('Should not get profile for unauthorized user', async () => {
     await request(app)
     .get('/users/me')
     .send()
     .expect(401)
 })

 test('should delete an authorsized user', async () => {
     await request(app)
     .delete('/users/me')
     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
     .send()
     .expect(200)
     
     const user = await User.findById(userOneId)
     expect(user).toBeNull()
 })

 test('should not delete unauthorized user', async () => {
     await request(app)
     .delete('/users/me')
     .send()
     .expect(401)
 })

 test('Should upload avatar image', async () => {
     await request(app)
     .post('/users/me/avatar')
     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
     .attach('avatar', 'tests/fixtures/celine-sayuri-tagami-448870-unsplash.jpg')
     .expect(200)

     const user = await User.findById(userOneId)
     expect(user.avatar).toEqual(expect.any(Buffer))
 })

 test('Should update valid user fileds', async () => {
     await request(app)
     .patch('/users/me')
     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
     .send({
         name: 'Jared'
     })
     .expect(200)

     const user = await User.findById(userOneId)
     expect(user.name).toBe('Jared')

 })


 test('Should not update invalid user fileds', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Stockholm'
    })
    .expect(400)

})