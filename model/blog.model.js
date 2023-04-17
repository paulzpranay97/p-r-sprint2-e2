const  mongoose= require("mongoose")

const BlogSchema=mongoose.Schema({
title:String,
des:String,
userID: String



})
const BlogModel= mongoose.model("blogs",BlogSchema)

module.exports={BlogModel}

