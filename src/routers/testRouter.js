const express = require('express')
const { types, randomDate, randomType, randomValue, randomShortString } = require('../utils/randomValues')
const nameToPath = require('../utils/pathUtils')

const randomString = () => types.string()

const testRouter = db => {
  const router = express.Router()

  router.route("/sizing").get((req, res) => {
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

  router.route("/collection").get(async (req, res) => {
    const cols = req.query.cols || 55
    const rows = req.query.rows || 55

    const testCollectionName = randomString()
    const testDescription = Array(20).fill(randomString()).join(" ")

    const testDetails = {
      path: nameToPath(testCollectionName),
      name: testCollectionName,
      description: testDescription,
      created_at: randomDate().getTime(),
      status: "draft"
    }

    const testSchema = {
      title: testCollectionName,
      type: "object",
      required: [],
      properties: {}
    }

    Array(cols).fill("").map(() => {
      const required = !!Math.round(Math.random())
      const title = randomShortString()
      const type = randomType()

      if (required) testSchema.required.push(title)
      testSchema.properties[title] = {
        title, type
      }
    })

    const items = Array(rows).fill("").map(() => {
      const item = {}
      const props = Object.keys(testSchema.properties)
      props.forEach(prop => {
        const type = testSchema.properties[prop].type
        item[prop] = randomValue(type)
      })

      return item
    })

    await db.collection("data-structures")
            .insertOne({
              details: testDetails,
              schema: testSchema
            })
    
    await db.createCollection(testDetails.path, {
      validator: { $jsonSchema: testSchema }
    })

    await db.collection(testDetails.path)
            .insertMany(items)
    
    res.status(200).send()
  })

  return router
}

module.exports = testRouter