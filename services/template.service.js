const { templateDb } = require("../db")

const templateService = {
  create: async (template) => {
    const created = await templateDb.create(template)
    return created._id
  },
  findOne: async (templateId) => {
    const template = await templateDb.findOne(templateId)
    return template
  }
}

module.exports = templateService