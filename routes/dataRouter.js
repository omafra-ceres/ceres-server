const express = require('express')
const mongo = require('mongodb')

const nameToPath = require('../utils/pathUtils')

const ObjectID = mongo.ObjectID

const dataRouter = db => {
  const router = express.Router()

  // const admin = db.admin()

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
          validator: { $jsonSchema: schema }
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
        console.log(err)
        res.status(400).send({message: err.errmsg})
      })
  })

  const getDetailUpdaters = details => (
    Object.keys(details)
      .map(key => ({ [`details.${key}`]: details[key] }))
      .reduce((obj, updater) => ({ ...obj, ...updater }) , {})
  )
  
  const getHeaderUpdaters = schema => {
    const updaters = []
    Object.keys(schema).forEach(id => {
      Object.keys(schema[id]).forEach(key => {
        updaters.push({ [`schema.properties.${id}.${key}`]: schema[id][key] })
      })
    })
    return updaters.reduce((obj, updater) => ({ ...obj, ...updater }) , {})
  }
  
  // Used to update details and schema properties of a data structure
  router.route("/:dataPath/update").post((req, res) => {
    const filter = { "details.path": req.params.dataPath }
    const { type, details, schema } = req.body
    const getUpdaters = {
      details: () => getDetailUpdaters(details),
      schema: () => getHeaderUpdaters(schema)
    }
    const updaters = (getUpdaters[type] || (() => ({})))()
    const update = { $set: { ...updaters }}

    db.collection("data-structures")
      .findOneAndUpdate(filter, update, { returnOriginal: false })
      .then((response) => {
        db.command({
          collMod: req.params.dataPath,
          validator: { $jsonSchema: response.value.schema }
        }).catch(console.error)
        res.status(200).send({
          message: "Dataset updated",
        })
      }).catch(err => {
        console.log(err)
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