const express = require('express')

const { adminController } = require('../controllers')

const adminRouter = (...middleWare) => {
  const router = express.Router()
  middleWare.forEach(mw => router.use(mw))

  router.get("/users", async (req, res) => {
    const users = await adminController.users.list()
      .catch((err) => {
        console.log(err)
        res.status(400).send({ message: "could not get users" })
      })
    if (users) {
      res.status(200).json(users)
    }
  })
  
  router.post("/create-user", async (req, res) => {
    adminController.users
      .create(req.body)
      .then(user => {
        console.log(user)
        res.status(200).send("user created")
      })
      .catch((err) => {
        console.log(err)
        res.status(400).send({ message: "could not create user" })
      })
  })

  return router
}

module.exports = adminRouter