
const userModel = require("../models/user.model")

const bcrypt = require("bcrypt")


const jwt = require("jsonwebtoken")

const redisClient = require("../helpers/redis")



const signup =  async (req,res) =>{

    try{

        const {name,email,password,preferred_city} = req.body
        
        const isUserPresent = await userModel.findOne({email})

         if(isUserPresent) return res.send("User already Present, login please")
         
         const hash = await bcrypt.hash(password,8)

         const newUser = new userModel({name,email, password: hash, preferred_city})

         await newUser.save()

         res.send("Signup Successful")

    } catch(err) {
          
        res.send(err)
    }

}

const login = async (req,res)=> {

    try {
         
        const {email, password} = req.body

        const isUserPresent  = await userModel.findOne({email})

        if(!isUserPresent) return res.send("Register please")

        const isPasswordCorrect = await bcrypt.compare(password,isUserPresent.password)

        if(!isPasswordCorrect) return res.send("Uer Invalid ")

        const token = await jwt.sign({userId:isUserPresent._id,preferred_city:isUserPresent.preferred_city},process.env.JWT_SECRET, {expiresIn:"6hr"})

        res.send({message: "Login done", token})


    } catch(err) {
         res.send(err)
    }

}

const logout = async (req,res) =>{

    try{

        const token = req.headers?.authorization?.split(" ")[1]

        if(!token) return res.status(403)

        await redisClient.set(token,token)

        res.send("logout done")


    }catch(err) {
        res.send(err)
    }
}

module.exports = {login,logout,signup}