const mongoSetup = require('../mongoSetup')
const mongo = require('mongodb')

const ObjectID = mongo.ObjectID

const create = async (template) => {
  const db = await mongoSetup.db("demo-db")
  
  const created = await db.collection("templates")
    .insertOne(template)
    .catch(console.error)
  
  return created.ops[0]
}

const findOne = async (templateId) => {
  const db = await mongoSetup.db("demo-db")
  
  const id = ObjectID(templateId)
  const template = await db.collection("templates")
    .findOne({ "_id": id })
    .catch(console.error)
  
  return template
}

module.exports = {
  create,
  findOne
}
