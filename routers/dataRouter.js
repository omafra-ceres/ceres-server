const express = require('express')
const mongo = require('mongodb')

const { datasetService, templateService } = require('../services')

const dataRouter = () => {
  const router = express.Router()

  // dataset index route
  router.route("/").get(async (req, res) => {
    const datasets = await datasetService.list()
    res.json(datasets)
  })

  // create dataset route: creates template and dataset
  router.route("/create").post(async (req, res) => {
    const { details, template } = req.body
    const datasetId = await datasetService.create(details, template)
    
    res.json({ id: datasetId.valueOf() })
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
    const dataset = await datasetService
      .get(req.params.datasetId)
      .catch(() => {
        res.status(400).send({ message: "could not get dataset" })
      })
    res.send(dataset)
  })

  router.route("/:datasetId/addItem").post(async (req, res) => {
    const { datasetId } = req.params
    const dataValues = req.body
    
    const item = await datasetService
      .addItem(datasetId, dataValues)
      .catch(() => {
        res.status(400).send({ message: "could not add item" })
      })
    
    res.status(200).send({ message: "Item added to dataset", item })
  })
  
  router.route("/:datasetId/deleted").get(async (req, res) => {
    const { datasetId } = req.params
    const items = await datasetService
      .getDeleted(datasetId)
      .catch(() => {
        res.status(400).send({ message: "could not get deleted items" })
      })

    res.send({ items })
  })

  router.route("/:datasetId/delete-items").post(async (req, res) => {
    const { datasetId } = req.params
    const ids = req.body.items
    
    datasetService
      .deleteItems(datasetId, ids)
      .catch(() => {
        res.status(400).send({ message: "could not delete items" })
      })
    
    res.status(200).send({
      message: "Items deleted"
    })
  })
  
  router.route("/:datasetId/recover-deleted").post(async (req, res) => {
    const { datasetId } = req.params
    const ids = req.body.items
    
    datasetService
      .recoverDeleted(datasetId, ids)
      .catch(() => {
        res.status(400).send({ message: "could not recover items" })
      })
    
    res.status(200).send({
      message: "Recovered items"
    })
  })

  // Used to update dataset details
  router.route("/:datasetId/update").post(async (req, res) => {
    const { datasetId } = req.params
    const details = req.body
    
    datasetService
      .updateDetails(datasetId, details)
      .catch(() => {
        res.status(400).send({ message: "could not update dataset details" })
      })
    
    res.status(200).send({
      message: "Dataset updated"
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