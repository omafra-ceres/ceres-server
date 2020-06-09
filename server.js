const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongo = require('mongodb')

const dataRouter = require('./routes/dataRouter')
const testRouter = require('./routes/testRouter')

const MongoClient = mongo.MongoClient

const PORT = 4000
const mongoConnectionString = "mongodb+srv://admin-user:admin-user@c4c-demo-yt3tv.azure.mongodb.net/test?retryWrites=true&w=majority"

MongoClient.connect(mongoConnectionString, {
  useUnifiedTopology: true
}).then(client => {
  console.log("MongoDB database connection established successfully")
  const db = client.db("demo-db")

  app.use(cors())
  app.use(bodyParser.json())

  app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT)
  })

  const dataRoutes = dataRouter(db)
  app.use('/data', dataRoutes)

  const testRoutes = testRouter(db)
  app.use('/test', testRoutes)

}).catch(console.error)
