const express = require('express')

const { adminService } = require('../services')

const adminRouter = (...middleWare) => {
  const router = express.Router()
  middleWare.forEach(mw => router.use(mw))

  router.get("/users", async (req, res) => {
    const users = await adminService.users.list()
      .catch((err) => {
        console.log(err)
        res.status(400).send({ message: "could not get users" })
      })
    if (users) {
      console.log(users)
      res.status(200).json(users)
    }
  })
  
  router.post("/create-user", async (req, res) => {
    adminService.users
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