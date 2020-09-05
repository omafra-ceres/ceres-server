const { userDb } = require('../db')

const adminService = {
  users: {
    list: userDb.list,
    create: userDb.create
  }
}

module.exports = adminService