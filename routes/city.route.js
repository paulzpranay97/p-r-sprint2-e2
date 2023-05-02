
const {Router } = require("express")

const { authenticator } = require("../middlewares/auth")

const {getCityForIP} = require("../controllers/city.controller")


const cityRouter = Router()

cityRouter.get("/currentcity",getCityForIP)

module.exports = cityRouter