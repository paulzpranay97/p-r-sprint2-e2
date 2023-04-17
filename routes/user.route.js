// login logout signup refresh-token
const { Router } = require("express")


const jwt = require("jsonwebtoken")

const bcrypt = require("bcrypt")


const {User} = require("../model/user.model")

const {Blacklist} = require("../model/blacklist.model")



const userRouter = Router()

userRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const isUserPresent = await User.findOne({ email })


    if (isUserPresent) {
      return res.status(400).send({ msg: "Already a user, please login" })
    }
    const hashedPassword = bcrypt.hashSync(password, 8)

    const newUser = new User({ name,email, password: hashedPassword,role })

    await newUser.save()

    res.send({ msg: "Signup successful", user: newUser })

  } catch (error) {
    res.status(500).send({ msg: error.message })

  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const isUserPresent = await User.findOne({ email })
    if (!isUserPresent) {
      // user not present
      return res.status(400).send({ msg: "Not a user, please signup" })
    }

    const isPasswordCorrect = bcrypt.compareSync(
      password,
      isUserPresent.password
    );
    if (!isPasswordCorrect)
      return res.status(400).send({ msg: "Wrong credentials" })
   

    
    const accessToken = jwt.sign(
      { email, role: isUserPresent.role},
      "jwtsecretkeyfromenvfile",
      { expiresIn: "1m"}
    )

    
    const refreshToken = jwt.sign(
      { email, role: isUserPresent.role },
      "jwtsecretkeyfromenvfileforrefresh",
      { expiresIn: "3m" }
    )
    
    res.cookie("AccessToken", accessToken, { maxAge: 2000 * 60 })
    res.cookie("RefreshToken", refreshToken, { maxAge: 1000 * 60 * 5 })
    res.send({ msg: "Login success" })
  } catch (error) {
    res.status(500).send({ msg: error.message })
  }
});
userRouter.get("/logout", async (req, res) => {
  try {
   
    const { AccessToken, RefreshToken } = req.cookies
    const blacklistAccessToken = new Blacklist(AccessToken)
    const blacklistRefreshToken = new Blacklist(RefreshToken)
    await blacklistAccessToken.save()
    await blacklistRefreshToken.save()
    res.send({ msg: "Logout successful" })
  } catch (error) {
    res.status(500).send({ msg: error.message })
  }
});

userRouter.get("/refresh-token", async (req, res) => {
  try {
    
    const RefreshToken = req.cookies.RefreshToken || req?.headers?.authorization
    
    const isTokenBlacklisted = await Blacklist.find({token:RefreshToken})
    if(isTokenBlacklisted) return res.status(400).send({msg:"Please login"})

    const isTokenValid = jwt.verify(
      RefreshToken,
      "jwtsecretkeyfromenvfileforrefresh"
    );
    if (!isTokenValid)
      return res.status(400).send({ msg: "Please login again." });

    const newAccessToken = jwt.sign(
      { email: isTokenValid.email, role: isTokenValid.role },
      "jwtsecretkeyfromenvfile",
      {expiresIn:"1m"}
    );
    
    res.cookie("AccessToken",newAccessToken,{maxAge:1000*60});
    res.send({msg:"Token generated"})
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
});

module.exports = {userRouter};