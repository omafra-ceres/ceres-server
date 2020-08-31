const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')

const dataRouter = require('./routers/dataRouter')

const PORT = process.env.PORT || 4000

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://ceres-demo.us.auth0.com/.well-known/jwks.json`
  }),

  audience: 'ceres-api',
  issuer: `https://ceres-demo.us.auth0.com/`,
  algorithms: ['RS256']
});

app.use(cors())
app.use(checkJwt)
app.use(bodyParser.json())

app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT)
})

const dataRoutes = dataRouter()
app.use('/data', dataRoutes)
