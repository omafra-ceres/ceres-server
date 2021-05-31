const assert = require('assert/strict')
const MongoClient = require('mongodb').MongoClient

let _db

async function connect(cb) {
  if (_db) {
    console.warn("Multiple DB connection attempts made")
    return cb(null, _db)
  }

  const mongoConnectionString = process.env.DB_URL
  const dbName = process.env.DB_NAME

  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

  try {
    const connection = await MongoClient.connect(mongoConnectionString, connectionOptions)
    const db = await connection.db(dbName)
    
    console.log(`Database connection established — connected to: ${dbName}`)
    _db = db

    return cb(null, _db)
  } catch (error) {
    console.error(error)
    return cb(error)
  }
}

function getDb() {
  assert(_db, "DB connection not established. Please call connect before getDb")
  return _db
}

module.exports = {
  connect,
  getDb
}