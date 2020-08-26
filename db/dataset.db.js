const mongoSetup = require('../mongoSetup')
const mongo = require('mongodb')

const ObjectID = mongo.ObjectID

const list = async (deleted=false) => {
  const db = await mongoSetup.db("demo-db")
  
  const filter = { "deleted_on": deleted ? { $exists: true } : null }
  const projection = { "_id": 1, "details": 1, "deleted_on": 1 }

  const list = db.collection("datasets")
    .find(filter, { projection })
    .toArray()
    .catch(console.error)
  
  return list
}

const create = async (details, templateId) => {
  const db = await mongoSetup.db("demo-db")

  const document = {
    "template_id": templateId,
    details
  }
  const created = await db.collection("datasets")
    .insertOne(document)
    .catch(console.error)
  
  return created.ops[0]
}

const findOne = async (datasetId) => {
  const db = await mongoSetup.db("demo-db")
  const id = ObjectID(datasetId)
  const dataset = db.collection("datasets")
    .findOne({ "_id": id })
    .catch(console.error)
  
  return dataset
}

const getData = async (datasetId, deleted=false, sort) => {
  const db = await mongoSetup.db("demo-db")
  const id = ObjectID(datasetId)
  
  const filter = {
    "dataset_id": id,
    "deleted_on": deleted ? { $exists: true } : null
  }

  const options = {
    sort: sort || { "created_on": 1 }
  }

  const data = db.collection("data")
    .find(filter, options)
    .toArray()
    .catch(console.error)

  return data
}

const hasDeleted = async (datasetId) => {
  const db = await mongoSetup.db("demo-db")
  const id = ObjectID(datasetId)

  const filter = {
    "dataset_id": id,
    "deleted_on": { $exists: true }
  }

  const check = await db.collection("data")
    .countDocuments(filter, { limit: 1 })
    .catch(console.error)
  
  return !!check
}

const addItem = async (datasetId, dataValues) => {
  const db = await mongoSetup.db("demo-db")
  const id = ObjectID(datasetId)
  
  const document = {
    "dataset_id": id,
    "created_on": Date.now(),
    "data_values": dataValues
  }
  const item = await db.collection("data")
    .insertOne(document)
    .catch(console.error)

  return item.ops[0]
}

const deleteItems = async (datasetId, ids) => {
  const db = await mongoSetup.db("demo-db")
  const id = ObjectID(datasetId)
  const idArray = ids.map(id => ObjectID(id))
  
  const filter = { "dataset_id": id, "_id": { $in: idArray }}
  const update = { $set: { "deleted_on": Date.now() }}
  
  const deleted = db.collection("data")
    .updateMany(filter, update)
    .catch(console.error)

  return deleted
}

const recoverDeleted = async (datasetId, ids) => {
  const db = await mongoSetup.db("demo-db")
  const id = ObjectID(datasetId)
  const idArray = ids.map(id => ObjectID(id))
  
  const filter = { "dataset_id": id, "_id": { $in: idArray }}
  const update = { $unset: { "deleted_on": "" }}
  
  const recovered = db.collection("data")
    .updateMany(filter, update)
    .catch(console.error)

  return recovered
}

const updateDetails = async (datasetId, details) => {
  const db = await mongoSetup.db("demo-db")
  const id = ObjectID(datasetId)
  
  const { name, description } = details
  const filter = { "_id": id }
  const update = { $set: { "details.name": name, "details.description": description }}

  const updated = db.collection("datasets")
    .findOneAndUpdate(filter, update)
    .catch(console.error)

  return updated
}

module.exports = {
  list,
  create,
  findOne,
  getData,
  hasDeleted,
  addItem,
  deleteItems,
  recoverDeleted,
  updateDetails
}
