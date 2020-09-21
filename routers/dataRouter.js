const express = require('express')

const { dataController } = require('../controllers')
const { Dataset } = require('../services')
const { datasetPermission } = require('../utils/middleware')

const dataRouter = (...middleWare) => {
  const router = express.Router()
  middleWare.forEach(mw => router.use(mw))

  router.param('datasetId', (req, res, next, id) => {
    req.dataset = new Dataset(id)
    next()
  })

  router.route("/:datasetId")
        .get(dataController.get)
        .put(datasetPermission(["edit:details"]), dataController.update)
        .post(datasetPermission(["add:items"]), dataController.add)
  
  router.route("/:datasetId/deleted")
        .get(datasetPermission(["recover:items"]), dataController.deleted)
        .put(datasetPermission(["recover:items"]), dataController.recoverItems)
        .post(datasetPermission(["delete:items"]), dataController.deleteItems)
  
  router.route("/:datasetId/collaborators")
        .get(dataController.collaborators)
        .post(datasetPermission(["update:collaborators"]), dataController.addCollaborator)
  
  router.post("/:datasetId/collaborators/delete", datasetPermission(["update:collaborators"]), dataController.removeCollaborator)
  
  return router
}

module.exports = dataRouter