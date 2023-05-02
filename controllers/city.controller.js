
const redisClient = require('../helpers/redis')
const axios = require('axios')


const getCityForIP = async (ip) => {
  
  const cachedCity = await redisClient.get(ip)
  if (cachedCity) {

    console.log(`city for IP ${ip}`)

    return JSON.parse(cachedCity);
  }

  
  const response = await axios.get(`https://ipinfo.io/47.11.73.56/json?token=cbf1165e1244db`)
  const city = response.data.city;

  
  redisClient.set(ip, JSON.stringify(city), 'EX', 60*60*6)

  console.log(`Retrieving city for IP ${ip} from API`)
  return city;
};


const ip = '123.123.123.123'
getCityForIP(ip)
  .then((city) => {
    console.log(`Current city for IP ${ip}: ${city}`)
  })
  .catch((error) => {
    console.error(error)
  });

  module.exports={getCityForIP}