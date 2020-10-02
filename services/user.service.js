const Template = require("./template.service")
const Dataset = require("./dataset.service")

const { userDb } = require("../db")
const { getUserId } = require('../utils/authUtils')

class User {
  constructor(id) {
    this.id = id
  }

  async getDatasets(deleted=false) {
    const datasets = await Dataset.list({
      owner: this.id,
      deleted
    })
    return datasets.map(set => ({
      id: set._id.valueOf(),
      ...set.details
    }))
  }

  // returns an array of the users datasets
  // return value: Promise
  get datasets() {
    return this.getDatasets()
  }

  get deleted() {
    return this.getDatasets(true)
  }

  // creates a new template and dataset
  // returned promise resolves to the new dataset id
  // return value: Promise
  async createDataset(details, template) {
    details.created_at = Date.now()
    template.owner_id = this.id
    const templateId = await Template.create(template)
    return Dataset.create(this.id, details, templateId)
  }

  static async list() {
    const users = await userDb.list()
    return users.map(user => {
      const id = getUserId({ sub: user.user_id })
      const { name, email } = user
      return { id, name, email }
    })
  }
}

module.exports = User