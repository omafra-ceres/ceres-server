const express = require('express')
const mongo = require('mongodb')

const nameToPath = require('../utils/pathUtils')

const ObjectID = mongo.ObjectID

const dataRouter = db => {
  const router = express.Router()

  router.route("/").get(async (req, res) => {
    const datasets = await db.collection("datasets")
      .find({ "is_deleted": null })
      .toArray()
      .catch(() => {
        res.status(400)
           .send({ message: "Whoops, something went wrong!" })
      })
    res.json(datasets.map(set => ({id: set._id.valueOf(), ...set.details})))
  })

  router.route("/create").post(async (req, res) => {
    const { details, template } = req.body
    details.created_at = Date.now()

    const createdTemplate = await db.collection("templates")
      .insertOne(template)
      .catch(() => {
        res.status(400)
           .send({ message: "Could not create template" })
      })

    const createdDataset = await db.collection("datasets")
      .insertOne({
        details,
        "template_id": createdTemplate.ops[0]._id
      }).catch(() => {
        res.status(400)
           .send({ message: "could not create dataset" })
      })
    
    res.json({ id: createdDataset.ops[0]._id.valueOf() })
  })

  // router.route("/delete").post((req, res) => {
  //   const deleteSchema = db.collection("data-structures").deleteOne({ "details.name": req.body.name })
  //   const dropCollection = db.collection(req.body.path).drop()

  //   Promise.all([deleteSchema, dropCollection])
  //     .then(() => {
  //       db.collection("data-structures")
  //         .find()
  //         .toArray()
  //         .then(datasets => {
  //           res.json(datasets.map(set => set.details))
  //         }).catch(() => {
  //           res.status(400).send({ message: "Could not get data structures" })
  //         })
  //     }).catch(() => {
  //       res.status(400).send({
  //         message: "Could not delete data structure"
  //       })
  //     })
  // })

  // router.route("/archive").post((req, res) => {
  //   const filter = { "details.path": req.body.path }
  //   const update = { $set: { "details.status": "archived" }}

  //   db.collection("data-structures")
  //     .findOneAndUpdate(filter, update, { returnOriginal: false })
  //     .then(() => {
  //       res.status(200).send({})
  //     })
  // })
  
  // router.route("/unarchive").post((req, res) => {
  //   const filter = { "details.path": req.body.path }
  //   const update = { $set: { "details.status": "published" }}

  //   db.collection("data-structures")
  //     .findOneAndUpdate(filter, update, { returnOriginal: false })
  //     .then(() => {
  //       res.status(200).send({})
  //     })
  // })

  router.route("/:datasetId").get(async (req, res) => {
    const datasetId = ObjectID(req.params.datasetId)
    
    const getDataset = db.collection("datasets")
      .findOne(datasetId)
      
    const getItems = db.collection("data")
      .find({ "dataset_id": req.params.datasetId })
      .toArray()

    const [dataset, items] = await Promise.all([
      getDataset,
      getItems
    ]).catch(() => {
      res.status(400)
         .send({ message: "could not get dataset" })
    })

    const template = await db.collection("templates")
      .findOne(dataset.template_id)
      .catch(() => {
        res.status(400)
           .send({ message: "could not get dataset" })
      })
    
    res.send({
      details: dataset.details,
      template,
      items
    })
  })

  router.route("/:datasetId").post(async (req, res) => {
    const document = await db.collection("data")
      .insertOne({
        "dataset_id": req.params.datasetId,
        "data_values": req.body
      }).catch(err => {
        res.status(400).send({message: err.errmsg})
      })
    res.status(200).send({
      message: "Item added to dataset",
      item: document.ops[0]
    })
  })

  // Used to update dataset details
  router.route("/:datasetId/update").post(async (req, res) => {
    const filter = {"_id": ObjectID(req.params.datasetId)}
    const { name, description } = req.body
    const update = { $set: {
      "details.name": name,
      "details.description": description
    }}

    await db.collection("datasets")
      .findOneAndUpdate(filter, update)
      .catch(err => {
        console.log(err)
        res.status(400).send({message: err.errmsg})
      })
    
    res.status(200).send({
      message: "Dataset updated",
    })
  })
  
  // Used to delete data schema fields
  // router.route("/:dataPath/delete").post((req, res) => {
  //   const filter = { "details.path": req.params.dataPath }
  //   const updaters = req.body.fields
  //     .map(id => `schema.properties.${id}`)
  //     .reduce((acc, cur) => {
  //       acc[cur] = ""
  //       return acc
  //     },{})
  //   const update = { $unset: updaters }

  //   db.collection("data-structures")
  //     .findOneAndUpdate(filter, update, { returnOriginal: false })
  //     .then((response) => {
  //       db.command({
  //         collMod: req.params.dataPath,
  //         validator: { $jsonSchema: response.value.schema }
  //       }).catch(console.error)
  //       res.status(200).send({
  //         message: "Dataset updated",
  //       })
  //     }).catch(err => {
  //       console.log(err)
  //       res.status(400).send({message: err.errmsg})
  //     })
  // })

  return router
}

module.exports = dataRouter