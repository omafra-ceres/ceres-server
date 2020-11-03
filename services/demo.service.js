const User = require('./user.service')

class Demo {
  static create(user) {
    return User.create(user)
  }
}

module.exports = Demo