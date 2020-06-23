const express = require('express')
const mongo = require('mongodb')

const ObjectID = mongo.ObjectID

const nameToPath = name => (
  name && name.toLowerCase()
    .replace(/[^a-z\d-_ ]/g, "")
    .trim()
    .replace(/[\s-_]+/g, "-")
)

const dataRouter = db => {
  const router = express.Router()

  router.route("/").get((req, res) => {
    db.collection("data-structures")
      .find()
      .toArray()
      .then(datasets => {
        res.json(datasets.map(set => set.details))
      }).catch(() => {
        res.status(400).send({ message: "Whoops, something went wrong!" })
      })
  })

  router.route("/create").post((req, res) => {
    const collectionPath = nameToPath(req.body.details.name)
    const {details, schema} = req.body
    details.path = collectionPath
    details.created_at = Date.now()
    details.status = "draft"

    db.collection("data-structures")
      .insertOne({details, schema})
      .then(() => {
        db.createCollection(details.path, {
          validator: schema
        }).then(() => {
            res.status(200).send()
          }).catch(() => {
            res.status(400).send({ message: "Could not create data structure" })
          })
      }).catch(() => {
        res.status(400).send({ message: "Could not create data structure" })
      })
  })

  router.route("/delete").post((req, res) => {
    const deleteSchema = db.collection("data-structures").deleteOne({ "details.name": req.body.name })
    const dropCollection = db.collection(req.body.path).drop()

    Promise.all([deleteSchema, dropCollection])
      .then(() => {
        db.collection("data-structures")
          .find()
          .toArray()
          .then(datasets => {
            res.json(datasets.map(set => set.details))
          }).catch(() => {
            res.status(400).send({ message: "Could not get data structures" })
          })
      }).catch(() => {
        res.status(400).send({
          message: "Could not delete data structure"
        })
      })
  })

  router.route("/:dataPath").get((req, res) => {
    const getStructure = db.collection("data-structures").findOne({ "details.path": req.params.dataPath })
    const getItems = db.collection(req.params.dataPath).find().toArray()

    Promise.all([getStructure, getItems])
      .then(results => {
        res.send({
          dataStructure: results[0],
          items: results[1]
        })
      }).catch((err) => {
        console.log(err)
        res.status(400).send({
          message: "Could not get data structure"
        })
      })
  })

  router.route("/:dataPath").post((req, res) => {
    db.collection(req.params.dataPath)
      .insertOne(req.body)
      .then(response => {
        res.status(200).send({
          message: "Item added to dataset",
          item: response.ops[0]
        })
      }).catch(err => {
        res.status(400).send({message: err.errmsg})
      })
  })
  
  // router.route("/:dataPath/:id").get((req, res) => {
  //   db.collection(req.params.collectionName)
  //     .findOne({ "_id": ObjectID(req.params.id) })
  //     .then(item => {
  //       res.json(item)
  //     })
  // })

  return router
}

module.exports = dataRouter