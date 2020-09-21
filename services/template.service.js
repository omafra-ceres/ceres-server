const { templateDb } = require("../db")

class Template {
  constructor(id) {
    this.id = id
    this.info = templateDb
      .findOne(id)
      .catch(err => { throw new Error(err) })
  }

  static async create(template) {
    const created = await templateDb
      .create(template)
      .catch(error => { throw new Error(error) })
    return created._id
  }
}

module.exports = Template