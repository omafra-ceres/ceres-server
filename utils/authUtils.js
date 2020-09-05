const ManagementClient = require('auth0').ManagementClient

const authClient = new ManagementClient({
  domain: "ceres-demo.us.auth0.com",
  clientId: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  scope: 'read:users update:users delete:users create:users read:roles'
})

module.exports = {
  authClient
}