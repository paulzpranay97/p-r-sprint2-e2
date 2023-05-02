const redis = require('redis')
const redisClient = redis.createClient({ host: 'localhost', port: 8080 })

const redisLimiter = (req, res, next) => {
  const ip = req.ip

  redisClient.get(ip, (err, data) => {
    if (err) throw err

    let no_requests = data ? parseInt(data) : 0

    if (no_requests < 3) {
      redisClient.set(ip, no_requests + 1)
      next()
    } else {
      res.status(429).json({ message: 'Too Many Requests' })
    }
  })
}

module.exports = redisLimiter