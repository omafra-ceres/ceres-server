const express = require('express')
const mongo = require('mongodb')

const ObjectID = mongo.ObjectID

const dataRouter = db => {
  const router = express.Router()

  router.route("/").get((req, res) => {
    db.collection("schemas")
      .find()
      .toArray()
      .then(schemas => {
        res.json(schemas.map(schema => schema.title))
      }).catch(() => {
        res.status(400).send({ message: "Whoops, something went wrong!" })
      })
  })

  router.route("/create").post((req, res) => {
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

  router.route("/delete").post((req, res) => {
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

  router.route("/:collectionName").get((req, res) => {
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

  router.route("/:collectionName").post((req, res) => {
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
  
  router.route("/:collectionName/:id").get((req, res) => {
    db.collection(req.params.collectionName)
      .findOne({ "_id": ObjectID(req.params.id) })
      .then(item => {
        res.json(item)
      })
  })

  return router
}

module.exports = dataRouter