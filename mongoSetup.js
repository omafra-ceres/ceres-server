const MongoClient = require('mongodb').MongoClient
const mongoConnectionString = process.env.DB_URL

const connection = MongoClient.connect(mongoConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(console.error)

const db = async name => {
  let database
  await connection.then(client => database = client.db(name))
  return database
}

module.exports = {
  db
}