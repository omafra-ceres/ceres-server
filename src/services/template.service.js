const { template } = require("../db")

class Template {
  constructor(id) {
    this.id = id
    this.info = template
      .findOne(id)
      .catch(err => { throw new Error(err) })
  }

  static async create(newTemplate) {
    const created = await template
      .create(newTemplate)
      .catch(error => { throw new Error(error) })
    return created._id
  }
}

module.exports = Template