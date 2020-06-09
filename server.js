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
            res.status(200).send()
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
  })

  dataRoutes.route("/:collectionName").get((req, res) => {
    const getSchema = db.collection("schemas").findOne({ "title": req.params.collectionName })
    const getItems = db.collection(req.params.collectionName).find().toArray()

    Promise.all([getSchema, getItems])
      .then(results => {
        res.send({
          schema: results[0],
          items: results[1]
        })
      }).catch((err) => {
        console.log(err)
        res.status(400).send({
          message: "Could not get collection"
        })
      })
  })

  dataRoutes.route("/:collectionName").post((req, res) => {
    console.log(req.body)
    db.collection(req.params.collectionName)
      .insertOne(req.body)
      .then(response => {
        res.status(200).send({
          message: "Item added to collection",
          item: response.ops[0]
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

  const testRoutes = express.Router()
  app.use('/test', testRoutes)

  testRoutes.route("/testSizing").get((req, res) => {
    const randomDate = () => new Date(Date.now() - (Math.floor(Math.random() * 86400000)))
    
    const randomString = () => (Math.random()+1).toString(36).substring(2)
    const randomNumber = () => Math.ceil(Math.random() * 1000)
    const randomBool = () => !!Math.round(Math.random())
    
    const randos = [randomString, randomNumber, randomBool]
    const randomValue = () => randos[Math.floor(Math.random() * 3)]()

    const testCollectionName = randomString()

    const promises = []
    
    for (let i = 0; i < 60; i++) {
      const doc = { date: randomDate() }
      for (let index = 0; index < 55; index++) {
        const key = randomString()
        const value = randomValue()
        doc[key] = value
      }
      const promise = db.collection(testCollectionName).insertOne(doc)
      promises.push(promise)
    }

    Promise.all(promises)
      .then(() => {
        res.send(db.collection(testCollectionName).countDocuments())
      })
  })
}).catch(console.error)
