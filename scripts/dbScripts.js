const mongo = require('../src/mongoSetup')
const ENV = require("../src/environment");

const templateSeeds = require('../db_seeds/templates.json')
const datasetSeeds = require('../db_seeds/datasets.json')
const dataSeeds = require('../db_seeds/data.json')

function dropCollection(collection) {
  return collection.drop().catch(err => {
    if (err.codeName !== "NamespaceNotFound") throw err
  })
}

async function reset(db) {
  if (process.env.NODE_ENV === "production") throw "⚠️ Database reset should not be run in production! ⚠️"

  try {
    const [
      templates,
      datasets,
      data
    ] = await Promise.all([
      db.collection("templates"),
      db.collection("datasets"),
      db.collection("data")
    ])

    await Promise.all([
      dropCollection(templates),
      dropCollection(datasets),
      dropCollection(data)
    ])

    const templateDocuments = await templates.insertMany(templateSeeds)
    const datasetDocuments = await datasets.insertMany(datasetSeeds.map(dataset => ({
      ...dataset,
      template_id: templateDocuments.insertedIds[dataset.template_id]
    })))
    await data.insertMany(dataSeeds.map(row => ({
      ...row,
      dataset_id: datasetDocuments.insertedIds[row.dataset_id]
    })))

    console.log("Database reset!")
    process.exit()
  } catch(err) {
    console.log("Error resetting database:", err)
    process.exit()
  }
}

mongo.connect((err, db) => {
  if (err) throw err
  return reset(db)
})
