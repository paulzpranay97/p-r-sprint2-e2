
const jwt = require("jsonwebtoken")

const redisClient = require("../helpers/redis")
require("dotenv").config()

const authenticator = async (req, res, next) => {

    try {
        const token = req.headers?.authorization?.split(" ")[1];

        
        if (!token) return res.status(401).send("please login again")

        const isTokenValid = await jwt.verify(token, process.env.JWT_SECRET)

        if (!isTokenValid) return res.send("Authentication failed, please login again")

        const isTokenBlacklisted = await redisClient.get(token)
        

        if (isTokenBlacklisted) return res.send("User is not authorized")



        req.body.userId = isTokenValid.userId

        req.body.preferred_city = isTokenValid.preferred_city

      
        next()

    } catch (err) {
        res.send(err.message)
    }
}

module.exports = { authenticator }