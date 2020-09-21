const { datasetDb } = require("../db")
const Template = require('./template.service')

const collaboratorPermissions = [
  "add:items",
  "delete:items",
  "recover:items",
  "edit:details",
  "edit:template"
]

const checkCollaboratorPermissions = check => check.every(ch => collaboratorPermissions.includes(ch))

class Dataset {
  constructor(id) {
    this.id = id
    this.info = datasetDb
      .findOne(id)
  }

  get items() {
    return datasetDb
      .getData(this.id)
  }

  get deleted() {
    return datasetDb
      .getData(this.id, true, { "deleted_on": -1 })
  }

  get template() {
    return (async () => {
      const { template_id } = await this.info
      const template = new Template(template_id)
      return template.info
    })()
  }

  get hasDeleted() {
    return datasetDb
      .hasDeleted(this.id)
  }

  get collaborators() {
    return (async () => {
      const { details: { collaborators }} = await this.info
      return collaborators || []
    })()
  }

  add(dataValues) {
    return datasetDb
      .addItem(this.id, dataValues)
  }

  deleteItems(ids) {
    return datasetDb
      .deleteItems(this.id, ids)
  }

  recoverDeleted(ids) {
    return datasetDb
      .recoverDeleted(this.id, ids)
  }

  update(updates) {
    return datasetDb
      .update(this.id, updates)
  }

  permissionCheck(userId) {
    return (async () => {
      const { owner_id, collaborator_ids } = await this.info
      const isOwner = owner_id === userId
      const isCollaborator = collaborator_ids && collaborator_ids.includes(userId)
      return check => isOwner || (isCollaborator && checkCollaboratorPermissions(check))
    })()
  }

  async addCollaborator(users) {
    const { details, collaborator_ids } = await this.info
    const updater = {
      collaborator_ids: [collaborator_ids, ...users.map(user => user.id)],
      details: {
        collaborators: [
          ...(details.collaborators || []),
          ...users
        ]
      }
    }
    return datasetDb.update(this.id, updater)
  }
  
  async removeCollaborator(userId) {
    const { details, collaborator_ids } = await this.info
    const updater = {
      collaborator_ids: collaborator_ids.filter(id => id !== userId),
      details: {
        collaborators: details.collaborators.filter(col => col.id !== userId)
      }
    }
    return datasetDb.update(this.id, updater)
  }

  static async create(userId, details, templateId) {
    const created = await datasetDb
      .create(userId, details, templateId)
    return created._id.valueOf()
  }

  static list(options) {
    return datasetDb.list(options)
  }
}

module.exports = Dataset