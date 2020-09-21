const { userDb } = require('../db')

class Demo {
  static create(user) {
    return userDb.create({ ...user })
  }
}

module.exports = Demo