const { authClient } = require('../utils/authUtils')

const list = () => {
  return authClient.users.getAll()
}

const create = userData => {
  const data = {
    ...userData,
    "connection": "email",
    "email_verified": true,
    "verify_email": false
  }
  return authClient.users.create(data)
}

module.exports = {
  list,
  create
}