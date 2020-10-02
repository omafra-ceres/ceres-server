const { User } = require('../services')

const userController = {
  datasets: async (req, res) => {
    try {
      res.json(await req.user.datasets)
    } catch(error) {
      res.status(400).send(error)
    }
  },
  getDeleted: async (req, res) => {
    try {
      res.json(await req.user.deleted)
    } catch(error) {
      res.status(400).send(error)
    }
  },
  createDataset: async (req, res) => {
    try {
      const { details, template } = req.body
      const datasetId = await req.user.createDataset(details, template)
      res.json({ id: datasetId })
    } catch(error) {
      console.error(error)
      res.status(400).send(error)
    }
  },
  list: async (req, res) => {
    User
      .list()
      .then(list => { res.send(list) })
      .catch((err) => {
        console.error(err)
        res.status(400).send({ message: "Could not get users" })
      })
  }
}

module.exports = userController