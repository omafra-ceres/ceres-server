const mongoSetup = require('../mongoSetup')
const mongo = require('mongodb')

const ObjectID = mongo.ObjectID

const { flattenObject } = require('../utils/typeUtils')

const list = async (options={}) => {
  const db = await mongoSetup.db("demo-db")
  
  const filter = {
    "deleted_on": options.deleted ? { $exists: true } : null,
    ...options.owner && {"owner_id": options.owner}
  }
  const projection = {
    "_id": 1,
    "details": 1,
    "deleted_on": 1
  }

  return await db.collection("datasets")
    .find(filter, { projection })
    .toArray()
    .catch(error => { throw new Error(error) })
}

const create = async (id, details, templateId) => {
  const db = await mongoSetup.db("demo-db")

  if (!id) throw new Error("Missing owner id")
  if (!details) throw new Error("Missing details")
  if (!templateId) throw new Error("Missing template id")

  const document = {
    "owner_id": id,
    "template_id": templateId,
    details
  }
  const created = await db.collection("datasets")
    .insertOne(document)
    .catch(error => { throw new Error(error) })
  
  return created.ops[0]
}

const findOne = async (datasetId) => {
  const db = await mongoSetup.db("demo-db")
  const id = ObjectID(datasetId)
  const dataset = db.collection("datasets")
    .findOne({ "_id": id })
    .catch(error => { throw new Error(error) })
  
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
    .catch(error => { throw new Error(error) })

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
    .catch(error => { throw new Error(error) })
  
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
    .catch(error => { throw new Error(error) })

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
    .catch(error => { throw new Error(error) })

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
    .catch(error => { throw new Error(error) })

  return recovered
}

const update = async (datasetId, updates) => {
  const db = await mongoSetup.db("demo-db")
  const id = ObjectID(datasetId)
  
  const filter = { "_id": id }
  const updaters = { $set: flattenObject(updates) }

  const updated = db.collection("datasets")
    .findOneAndUpdate(filter, updaters)
    .catch(error => { throw new Error(error) })

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
  update
}
