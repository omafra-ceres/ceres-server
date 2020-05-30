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
    db.collection("schemas")
      .find()
      .toArray()
      .then(schemas => {
        res.json(schemas.map(schema => schema.title))
      }).catch(() => {
        res.status(400).send({ message: "Whoops, something went wrong!" })
      })
  })

  dataRoutes.route("/create").post((req, res) => {
    db.collection("schemas")
      .insertOne(req.body.schema)
      .then(() => {
        db.createCollection(req.body.schema.title)
          .then(() => {
            res.status(200)
          }).catch(() => {
            res.status(400).send({ message: "Could not create collection" })
          })
      }).catch(() => {
        res.status(400).send({ message: "Could not create collection" })
      })
  })

  dataRoutes.route("/delete").post((req, res) => {
    const deleteSchema = db.collection("schemas").deleteOne({ title: req.body.collection })
    const dropCollection = db.collection(req.body.collection).drop()

    Promise.all([deleteSchema, dropCollection])
      .then(() => {
        db.collection("schemas")
          .find()
          .toArray()
          .then(schemas => {
            res.json(schemas.map(schema => schema.title))
          }).catch(() => {
            res.status(400).send({ message: "Could not get schemas" })
          })
      }).catch(() => {
        res.status(400).send({
          message: "Could not delete collection"
        })
      })
    
    // db.collection(req.body.collection)
    //   .drop()
    //   .then(() => {
    //     db.collection("schemas").deleteOne
    //     res.status(200).send({ message: "collection deleted" })
    //   }).catch(() => {
    //     res.status(400).send({ message: "could not delete collection" })
    //   })
  })

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
