const mongoose = require("mongoose")

require("dotenv").config()

const connection = () => {
    mongoose.connect(process.env.MONOGO_URI)
}

module.exports= {connection}