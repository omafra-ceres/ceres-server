const ManagementClient = require('auth0').ManagementClient
const mongoSetup = require('../mongoSetup')
const ObjectID = require('mongodb').ObjectID

const authClient = new ManagementClient({
  domain: "ceres-demo.us.auth0.com",
  clientId: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  scope: 'read:users update:users delete:users create:users read:roles'
})

const getUserId = auth => auth.sub.split("|")[1]

const collaboratorPermissions = [
  "add:items",
  "delete:items",
  "recover:items",
  "edit:details",
  "edit:template"
]

const checkCollPerm = check => check.every(ch => collaboratorPermissions.includes(ch))

const getPermissionCheck = async (userId, datasetId) => {
  const db = await mongoSetup.db("demo-db")
  const dataset = ObjectID(datasetId)
  const filter = {
    "_id": dataset,
    $or: [
      { "owner_id": userId },
      { "collaborator_ids": { $in: [ userId ] } }
    ]
  }
  
  const response = await db.collection("datasets")
    .findOne(filter, {
      projection: {
        owner_id: 1,
        collaborator_ids: 1
      }
    })
    .catch(err => { throw new Error(err) })

  const { isOwner, isCollaborator } = {
    isOwner: response.owner_id === userId,
    isCollaborator: response.collaborator_ids && response.collaborator_ids.includes(userId)
  }

  return check => isOwner || (isCollaborator && checkCollPerm(check))
}

const authService = async (req, res) => {
  const id = getUserId(req.auth)
  const { datasetId } = req.params
  const permissionCheck = await getPermissionCheck(id, datasetId)

  return (permissions, callback) => {
    if (permissionCheck(permissions)) {
      callback()
    } else {
      res.status(401).send({ message: "Not authorized" })
    }
  }
}

module.exports = {
  authClient,
  getUserId,
  authService
}