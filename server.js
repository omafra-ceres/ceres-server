const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const { checkJwt, checkRoles } = require('./utils/jwtUtils')
const { getUser } = require('./utils/middleware')

const { userRouter, dataRouter, adminRouter } = require('./routers')

const PORT = process.env.PORT || 4000

app.use(cors())
app.use(bodyParser.json())

app.use(checkJwt)
app.use(getUser)

app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT)
})

const dataRoutes = dataRouter()
app.use('/data', dataRoutes)

const userRoutes = userRouter()
app.use('/user', userRoutes)

const adminRoutes = adminRouter(checkRoles([ 'admin' ]))
app.use('/admin', adminRoutes)
