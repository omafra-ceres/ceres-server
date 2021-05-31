const express = require('express')

const { Demo } = require('../services')

const demoRouter = (...middleWare) => {
  const router = express.Router()
  middleWare.forEach(mw => router.use(mw))

  router.post("/create-user", async (req, res) => {
    Demo
      .create(req.body)
      .then(() => { res.status(200).send() })
      .catch((err) => {
        console.log(err)
        res.status(400).send({ message: "could not create user" })
      })
  })

  return router
}

module.exports = demoRouter