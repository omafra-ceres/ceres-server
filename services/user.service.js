const Template = require("./template.service")
const Dataset = require("./dataset.service")

const { userDb } = require("../db")
const { getUserId } = require('../utils/authUtils')

class User {
  constructor(id) {
    this.id = id
  }

  // returns an array of the users datasets
  // return value: Promise
  get datasets() {
    const getDatasets = async () => {
      const datasets = await Dataset
        .list({ owner: this.id })
      return datasets.map(set => ({
        id: set._id.valueOf(),
        ...set.details
      }))
    }
    return getDatasets()
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