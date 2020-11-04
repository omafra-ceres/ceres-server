const { User } = require('../services')

const adminController = {
  users: {
    list: User.list,
    create: User.create
  }
}

module.exports = adminController