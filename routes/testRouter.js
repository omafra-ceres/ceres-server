const express = require('express')

const testRouter = db => {
  const router = express.Router()

  router.route("/testSizing").get((req, res) => {
    const randomDate = () => new Date(Date.now() - (Math.floor(Math.random() * 86400000)))
    
    const randomString = () => (Math.random()+1).toString(36).substring(2)
    const randomNumber = () => Math.ceil(Math.random() * 1000)
    const randomBool = () => !!Math.round(Math.random())
    
    const randos = [randomString, randomNumber, randomBool]
    const randomValue = () => randos[Math.floor(Math.random() * 3)]()

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

  return router
}

module.exports = testRouter