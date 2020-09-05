const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const { checkJwt, checkRoles } = require('./utils/jwtUtils')

const { dataRouter, adminRouter } = require('./routers')

const PORT = process.env.PORT || 4000

app.use(cors())
app.use(bodyParser.json())

app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT)
})

const dataRoutes = dataRouter(checkJwt)
app.use('/data', dataRoutes)

const adminRoutes = adminRouter(checkJwt, checkRoles([ 'admin' ]))
app.use('/admin', adminRoutes)
