const dataController = {
  get: async (req, res) => {
    try {
      const [ info, items, template, hasDeleted ] = await Promise.all([
        req.dataset.info,
        req.dataset.items,
        req.dataset.template,
        req.dataset.hasDeleted,
      ])
      res.send({ dataset: info, items, template, hasDeleted })
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  },
  add: async (req, res) => {
    req.dataset
      .add(req.body)
      .then(item => {
        res.status(200).send({ item })
      }).catch(error => {
        res.status(400).send(error)
      })
  },
  deleted: async (req, res) => {
    req.dataset
      .deleted
      .then(items => {
        res.status(200).send({ items })
      }).catch(() => {
        res.status(400).send({ message: "Could not get deleted items" })
      })
  },
  deleteItems: async (req, res) => {
    req.dataset
      .deleteItems(req.body.items)
      .then(() => { res.status(200).send() })
      .catch(() => {
        res.status(400).send({ message: "Could not delete items" })
      })
  },
  recoverItems: async (req, res) => {
    req.dataset
      .recoverDeleted(req.body.items)
      .then(() => { res.status(200).send() })
      .catch(() => {
        res.status(400).send({ message: "Could not recover items" })
      })
  },
  update: async (req, res) => {
    req.dataset
      .update(req.body)
      .then(() => { res.status(200).send() })
      .catch((err) => {
        console.error(err)
        res.status(400).send({ message: "Could not update details" })
      })
  },
  collaborators: async (req, res) => {
    req.dataset
      .collaborators
      .then(collaborators => { res.status(200).send({ collaborators }) })
      .catch((err) => {
        res.status(400).send({ message: "Could not get collaborators" })
      })
  },
  addCollaborator: async (req, res) => {
    req.dataset
      .addCollaborator(req.body)
      .then(() => { res.status(200).send() })
      .catch((err) => {
        console.error(err)
        res.status(400).send({ message: "Could not add collaborator" })
      })
  },
  removeCollaborator: async (req, res) => {
    req.dataset
      .removeCollaborator(req.body.id)
      .then(() => { res.status(200).send() })
      .catch((err) => {
        console.error(err)
        res.status(400).send({ message: "Could not remove collaborator" })
      })
  },
  recoverDataset: async (req, res) => {
    req.dataset
      .update({ deleted_on: null })
      .then(() => { res.status(200).send() })
      .catch((err) => {
        console.error(err)
        res.status(400).send({ message: "Could recover dataset" })
      })
  }, 
  archiveDataset: async (req, res) => {
    req.dataset
      .update({ deleted_on: Date.now() })
      .then(() => { res.status(200).send() })
      .catch((err) => {
        console.error(err)
        res.status(400).send({ message: "Could delete dataset" })
      })
  },
  listGlobal: async (req, res) => {
    try {
      res.json(await req.user.datasets)
    } catch(error) {
      res.status(400).send(error)
    }
  },
  createGlobal: async (req, res) => {
    try {
      const { details, template } = req.body
      const datasetId = await req.user.createDataset(details, template)
      res.json({ id: datasetId })
    } catch(error) {
      console.error(error)
      res.status(400).send(error)
    }
  },
  getGlobalOptions: async (req, res) => {
    try {
      const items = await req.dataset.items
      res.json({ ops: items.map(item => Object.values(item.data_values)[0]) })
    } catch(error) {
      console.error(error)
      res.status(400).send(error)
    }
  }
}

module.exports = dataController