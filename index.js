const express = require("express")


const {connection} = require("./db")
const {userRouter} = require("./routes/user.route")
const {auth} = require("./midlewares/auth")



require("dotenv").config()

const nodemailer = require("nodemailer")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const { blogRouter } = require("./routes/blog.route")

const trasports = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "paulpranay1997@gmail.com",
    pass: process.env.GOOGLE_PASS,
  },
});

function otpgenerator() {
  let otp = ""
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10)
  }
  return otp;
}

const app = express()

app.use(express.json())


app.use(cookieParser())


app.use(
  session({
    resave: true,
    secret: "your secret",
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.send("connected")
});

app.use("/auth", userRouter)


app.get("/get-otp", async (req, res) => {
  const { email } = req.body; 
  const otp = otpgenerator();
  trasports
    .sendMail({
      to: [email],
      from: "paulpranay1997@gmail.com",
      subject: "OTP verification",
      text: `Your OTP for the password reset process is ${otp}`,
    })
    .then((result) => {
      console.log(result);
      req.session.OTP = otp;
      console.log(req.session.OTP)
      res.send("Email sent")
    })
    .catch((err) => {
      console.log(err)
      console.log(err.message)
      res.send("Something wrong happend")
    });
});

app.get("/verify-otp", async (req, res) => {
  const { OTP } = req.query
  const serverOtp = req.session.OTP
  console.log(req.session)
  console.log(OTP, serverOtp)
  if (OTP == serverOtp) {
    
    res.send("OTP verified")
  } else {
    res.send("Wrong otp")
  }
});


const roles = {
  user: {
    permissions: ['read', 'write', 'delete','update']
  },
  moderator: {
    permissions: ['delete']
  }
};


function checkRole(role) {
  return function(req, res, next) {
    if (req.user && roles[req.user.role] && roles[req.user.role].permissions.includes(req.method.toLowerCase())) {
      return next();
    } else {
      return res.status(403).send('Forbidden');
    }
  };
}


app.use('/user', checkRole('user'), blogRouter)

app.get('/morderator', checkRole('morderator'),blogRouter )

app.listen(process.env.port , async () => {
  try {
    await connection;
    console.log(`Listeing on ${process.env.port}` );
  } catch (error) {
    console.log(error.message);
  }
})