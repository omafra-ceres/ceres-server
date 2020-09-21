const mongoSetup = require('../mongoSetup')
const mongo = require('mongodb')

const ObjectID = mongo.ObjectID

const create = async (template) => {
  const db = await mongoSetup.db("demo-db")
  
  const created = await db.collection("templates")
    .insertOne(template)
    .catch(error => { throw new Error(error) })
  
  return created.ops[0]
}

const findOne = async (templateId) => {
  const db = await mongoSetup.db("demo-db")
  
  const id = ObjectID(templateId)
  const template = await db.collection("templates")
    .findOne({ "_id": id })
    .catch(err => { throw new Error(err) })
  
  return template
}

module.exports = {
  create,
  findOne
}
