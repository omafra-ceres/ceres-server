const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongo = require('mongodb')

const ObjectID = mongo.ObjectID
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

  const dataRoutes = express.Router()
  app.use('/data', dataRoutes)

  dataRoutes.route("/").get((req, res) => {
    db.collections()
      .then(collections => {
        res.json(collections.map(col => col.collectionName))
      }).catch( () => {
        res.status(400).send({ message: "Whoops, something went wrong!" })
      })
  })

  // dataRoutes.route("/create").post((req, res) => {
    
  // })

  dataRoutes.route("/:collectionName").get((req, res) => {
    db.collection(req.params.collectionName)
      .find()
      .toArray()
      .then(items => {
        res.json(items)
      })
  })

  dataRoutes.route("/:collectionName").post((req, res) => {
    db.collection(req.params.collectionName)
      .insertOne(req.body)
      .then(item => {
        res.status(200).send({
          message: "Item added to collection",
          item: item
        })
      })
  })
  
  dataRoutes.route("/:collectionName/:id").get((req, res) => {
    db.collection(req.params.collectionName)
      .findOne({ "_id": ObjectID(req.params.id) })
      .then(item => {
        res.json(item)
      })
  })
}).catch(console.error)
