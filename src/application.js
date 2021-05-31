const express = require('express')
const cors = require('cors')

const app = express()

const { checkJwt, checkRoles } = require('./utils/jwtUtils')
const { getUser } = require('./utils/middleware')

const {
  userRouter,
  dataRouter,
  adminRouter,
  demoRouter
} = require('./routers')

module.exports = function application(ENV) {
  app.use(cors())
  app.use(express.json())

  // Demo routes that do not require authentication
  const demoRoutes = demoRouter()
  app.use('/demo', demoRoutes)

  app.use(checkJwt)
  app.use(getUser)

  const dataRoutes = dataRouter()
  app.use('/data', dataRoutes)

  const userRoutes = userRouter()
  app.use('/user', userRoutes)

  const adminRoutes = adminRouter(checkRoles([ 'admin' ]))
  app.use('/admin', adminRoutes)

  return app
}