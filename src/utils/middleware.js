const { User } = require('../services')
const { getUserId } = require('./authUtils')

// Adds instance of User class to req object
const getUser = (req, res, next) => {
  const id = getUserId(req.auth)
  const user = new User(id)
  req.user = user
  next()
}

const setGlobalUser = (req, res, next) => {
  req.user = new User("000")
  next()
}

const datasetPermission = check => (
  async (req, res, next) => {
    const { user, dataset } = req
    const permissionCheck = await dataset.permissionCheck(user.id)
    if (permissionCheck(check)) {
      next()
    } else {
      res.status(401).send({ message: "Not authorized" })
    }
  }
)

module.exports = {
  getUser,
  datasetPermission,
  setGlobalUser
}