const express = require('express')

const { userController } = require('../controllers')

const userRouter = (...middleWare) => {
  const router = express.Router()
  middleWare.forEach(mw => router.use(mw))

  router.get("/users", userController.list)
  router.get("/datasets", userController.datasets)
  router.get("/deleted", userController.getDeleted)
  router.post("/create-dataset", userController.createDataset)

  return router
}

module.exports = userRouter
