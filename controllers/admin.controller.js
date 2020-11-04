const User = require('./user.service')

const adminController = {
  users: {
    list: User.list,
    create: User.create
  }
}

module.exports = adminController