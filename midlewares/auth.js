const jwt = require("jsonwebtoken");
const {Blacklist} = require("../model/blacklist.model");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const auth = async (req, res, next) => {
 
  const { AccessToken } = req.cookies;
  const isTokenBlacklisted = await Blacklist.findOne({ token: AccessToken });
  if (isTokenBlacklisted)
    return res.status(400).send({ msg: "Please login..." })

  jwt.verify(
    AccessToken,
    "jwtsecretkeyfromenvfile",
    async (err, decoded) => {
      if (err) {
        if (err.message === "jwt expired") {
          const newAccessToken = await fetch(
            "http://localhost:9019/auth/refresh-token",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: req.cookies.RefreshToken,
              },
            }
          ).then((res) => res.json());
          res.cookie("AccessToken",newAccessToken,{maxAge:2000*60})
          
          next();
        }
      } else {
        console.log(decoded);
        next();
      }
    }
  );
};

module.exports = {auth};