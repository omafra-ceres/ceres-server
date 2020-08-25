const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const dataRouter = require('./routers/dataRouter')
const testRouter = require('./routers/testRouter')

// const mongoSetup = require('./mongoSetup')
// mongoSetup.connect().then(() => console.log("MongoDB database connection established successfully"))

const PORT = process.env.PORT || 4000

// MongoClient.connect(mongoConnectionString, {
//   useUnifiedTopology: true
// }).then(client => {
//   console.log("MongoDB database connection established successfully")
//   const db = client.db("demo-db")

//   app.use(cors())
//   app.use(bodyParser.json())

//   app.listen(PORT, () => {
//     console.log("Server is running on port: " + PORT)
//   })

//   const dataRoutes = dataRouter(db)
//   app.use('/data', dataRoutes)

//   const testRoutes = testRouter(db)
//   app.use('/test', testRoutes)

// }).catch(console.error)

app.use(cors())
app.use(bodyParser.json())

app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT)
})

const dataRoutes = dataRouter()
app.use('/data', dataRoutes)

// const testRoutes = testRouter()
// app.use('/test', testRoutes)
