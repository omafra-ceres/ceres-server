const express = require('express')

const { dataController } = require('../controllers')
const { Dataset } = require('../services')
const { datasetPermission, setGlobalUser } = require('../utils/middleware')
const { checkRoles } = require('../utils/jwtUtils')

const dataRouter = (...middleWare) => {
  const router = express.Router()
  middleWare.forEach(mw => router.use(mw))

  router.param('datasetId', (req, res, next, id) => {
    req.dataset = new Dataset(id)
    next()
  })

  router.route("/global")
        .all(setGlobalUser)
        .get(dataController.listGlobal)
        .post(checkRoles(["admin"]), dataController.createGlobal)

  router.put("/global/:datasetId", setGlobalUser, checkRoles(["admin"]), dataController.update)
  router.post("/global/:datasetId/collaborators", setGlobalUser, checkRoles(["admin"]), dataController.addCollaborator)
  router.post("/global/:datasetId/collaborators/delete", setGlobalUser, checkRoles(["admin"]), dataController.removeCollaborator)

  router.route("/:datasetId")
        .get(dataController.get)
        .put(datasetPermission(["edit:details"]), dataController.update)
        .post(datasetPermission(["add:items"]), dataController.add)
  
  router.route("/:datasetId/archive")
        .put(datasetPermission(["recover:dataset"]), dataController.recoverDataset)
        .post(datasetPermission(["delete:dataset"]), dataController.archiveDataset)
  
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