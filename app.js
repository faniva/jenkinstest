require('dotenv').config()

const express = require('express'),
    fs = require('fs'),
    promisify = require('util').promisify,
    bodyParser = require('body-parser'),
    Router = express.Router,
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    {cuid} = require('./util'),
    {secret} = require('./config'),
    {validateToken} = require('./middlewares')

const port = 9292

const router = Router()
const app = express()


app.use(bodyParser.json())


const goals = [
    {
        id: 1,
        title: 'Lose 50 pounds',
        type: 'fitness',
        progress: 40,
        views: 23,
        created_by: 'josefano09',
        created_date: '2019-04-09 00:00:00'
    },
    {
        id: 2,
        title: 'Save 4000 dollars',
        type: 'budgeting',
        progress: 10,
        views: 241,
        created_by: 'josefano09',
        created_date: '2019-04-09 00:00:00'
    },
    {
        id: 3,
        title: 'Meditate every day',
        type: 'health',
        progress: 55,
        views: 299,
        created_by: 'josefano09',
        created_date: '2019-04-09 00:00:00'
    }
]

const users = [
]

/* API ROUTES */
router.post('/signup', function(req,res,next){

    const {username,password, repassword} = req.body

    if(!username || !password){
        res.status = 402
        return res.send('Please enter required fields')
    }

    // Check users
    const usersSet = new Set(users)
    if(usersSet.has(username)){
        res.status = 503
        return res.send('Username already exists')
    }

    if(password !== repassword){
        res.status = 503
        return res.send('Passwords dont match')
    }

    bcrypt.hash(password, 10, (err,hash) => {
        if(err){
            console.log(err)
            return res.status(503)
                        .send('Error creating the user')
        }

        console.log(hash)

        // Insert the user
        const user = {
            username,
            id: cuid(req),
            password: hash
        }

        users.push(user)

        res.status = 200
        res.send('New user ' + user.username + ' created')

    })

})

router.post('/login', function(req,res,next){
    const {username,password} = req.body

    // Validate
    if(!username || !password){
        return res.status(400)
            .send('Missing requiered fields')
    }

    // Find the user by username
    let user = users.filter( u => {
        return u.username === username
    })
    user = user && user[0]

    if(!user)
        return res.status(401).send('User not found with that username')

    bcrypt.compare(password, user.password, (err,same) => {
        if(err) return next(err)

        if(same){
            jwt.sign({username: user.username, userid: user.id,
                expiresIn:  "12h",
                algorithm:  "RS256" }, secret, (err,encoded) => {
                    if(err) return next(err)

                    console.log(encoded)
                    res.status(200).send(encoded)
                })
        } else {
            res.status(401).send('Invalid password')
        }
    })

})
router.get('/goals', validateToken, function(req,res,next){
    res.send(goals)
})
router.post('/goals', validateToken, function(req,res,next){
    const payload = req.body
    const {title,type} = payload

    const date = new Date().toISOString()

    goals.push({
        id: cuid(req),
        title,
        type,
        views: 0,
        created_by: req.username || '',
        created_date: date
    })

    res.status(201)
        .send('Created new goal')
})

app.use('/api', router)


app.use(function(err,req,res,next){

    res.status = err.status || 500

    res.json({
        success: false,
        message: err.message || 'Error processing the request.',
        error: err.stack
    })

})

app.listen(port, function(){
    console.log('Server is running on port ' + port)
})