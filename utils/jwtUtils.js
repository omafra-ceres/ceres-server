const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')
const jwtAuthz = require('express-jwt-authz')

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://ceres-demo.us.auth0.com/.well-known/jwks.json`
  }),

  audience: 'ceres-api',
  issuer: `https://ceres-demo.us.auth0.com/`,
  algorithms: ['RS256']
})

const checkRoles = roles => jwtAuthz(roles, { customScopeKey: 'http://omafra-ceres.herokuapp.com/roles' })

module.exports = {
  checkJwt,
  checkRoles
}