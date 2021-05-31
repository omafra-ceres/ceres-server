const { connect } = require("./mongoSetup")

const PORT = process.env.PORT || 4000
const ENV = require("./environment");

const app = require("./application")(ENV)

connect(function(err) {
  if (err) throw err
  app.listen(PORT, function(err) {
    if (err) throw err
    console.log(`Server is running on port ${PORT} in ${ENV} mode.`)
  })
})
