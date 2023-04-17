const mongoose= require("mongoose")

const BlogSchema= mongoose.Schema({
    title:String,
    des:String
})

const BlogModel= mongoose.model("blog", BlogSchema)

module.exports={BlogModel}