const User = require('./user.service')

const adminService = {
  users: {
    list: User.list,
    create: User.create
  }
}

module.exports = adminService