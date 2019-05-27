const jwt = require('jsonwebtoken')
const {secret} = require('./config')


export const validateToken = (req,res,next) => {
    if(!req.headers.authorization){
        return res.status(401).send('Unauthorized')
    }

    const token = req.headers.authorization.split(' ')[1]
    console.log(token)

    const verified = jwt.verify(token, secret)

    if(!verified)
        return res.status(401).send('Unauthorized')

    console.log(verified)

    req.username = verified.username

    next()
}